"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { useModel } from "@/contexts/ModelContext";
import { useSettings } from "@/contexts/SettingsContext";
import { preprocessFrame } from "@/services/gesture-model/preprocessing";
import { runInference } from "@/services/gesture-model/predictor";
import { GesturePrediction } from "@/services/gesture-model/types";
import { PredictionSmoother } from "@/lib/prediction-smoother";
import { audioManager } from "@/services/audio/audio-manager";

export function useInference(videoRef: React.RefObject<HTMLVideoElement | null>, isCameraActive: boolean) {
  const { model, classes, status: modelStatus } = useModel();
  const { settings } = useSettings();

  const [rawPrediction, setRawPrediction] = useState<GesturePrediction | null>(null);
  const [stableGesture, setStableGesture] = useState<string>("none");
  const [stableConfidence, setStableConfidence] = useState<number>(0);
  const [actualFps, setActualFps] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number>(0);

  const smootherRef = useRef<PredictionSmoother>(
    new PredictionSmoother({
      confidenceThreshold: settings.confidenceThreshold,
      cooldownMs: 800,
    })
  );

  const frameCountRef = useRef<number>(0);
  const lastFpsTimeRef = useRef<number>(performance.now());
  const isRunningRef = useRef<boolean>(false);

  // Update smoother options when settings change
  useEffect(() => {
    smootherRef.current.updateSettings({
      confidenceThreshold: settings.confidenceThreshold,
    });
    audioManager.setEnabled(settings.audioEnabled);
    audioManager.setVolume(settings.volume);
  }, [settings]);

  useEffect(() => {
    if (!isCameraActive || modelStatus !== "ready" || !model || !videoRef.current) {
      isRunningRef.current = false;
      return;
    }

    isRunningRef.current = true;
    const intervalMs = 1000 / settings.targetFps;

    const runLoop = async () => {
      if (!isRunningRef.current || !videoRef.current || videoRef.current.readyState < 2) {
        return;
      }

      try {
        // 1. Preprocess frame into [1, 224, 224, 3] tensor
        const inputTensor = preprocessFrame(videoRef.current);

        // 2. Run prediction
        const pred = runInference(model, inputTensor, classes);

        // 3. Memory cleanup
        tf.dispose(inputTensor);

        setRawPrediction(pred);
        setLatencyMs(pred.inferenceTimeMs);

        // 4. Push prediction to Smoother
        const { stableGesture: winner, isNewTrigger, confidence } = smootherRef.current.push(pred);

        setStableGesture(winner);
        setStableConfidence(confidence);

        // 5. Trigger spoken audio on new stable gesture trigger
        if (isNewTrigger && winner !== "none") {
          audioManager.playGestureAudio(winner);
        }

        // FPS calculation
        frameCountRef.current += 1;
        const now = performance.now();
        const delta = now - lastFpsTimeRef.current;
        if (delta >= 1000) {
          setActualFps(Math.round((frameCountRef.current * 1000) / delta));
          frameCountRef.current = 0;
          lastFpsTimeRef.current = now;
        }
      } catch (err) {
        console.error("Inference loop error:", err);
      }
    };

    const timer = setInterval(runLoop, intervalMs);

    return () => {
      isRunningRef.current = false;
      clearInterval(timer);
    };
  }, [isCameraActive, modelStatus, model, classes, settings.targetFps, videoRef]);

  return {
    rawPrediction,
    stableGesture,
    stableConfidence,
    actualFps,
    latencyMs,
  };
}

"use client";

import React from "react";
import { Volume2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { GESTURE_CONFIG } from "@/config/gestures";
import { GesturePrediction } from "@/services/gesture-model/types";
import { audioManager } from "@/services/audio/audio-manager";

interface PredictionCardProps {
  rawPrediction: GesturePrediction | null;
  stableGesture: string;
  stableConfidence: number;
  isCameraActive: boolean;
}

export function PredictionCard({
  rawPrediction,
  stableGesture,
  stableConfidence,
  isCameraActive,
}: PredictionCardProps) {
  const currentConfig = GESTURE_CONFIG[stableGesture] || {
    name: stableGesture !== "none" ? stableGesture : "Waiting for Gesture...",
    description: "Position your hand inside the webcam frame to detect gestures in real-time.",
    category: "other",
  };

  const confidencePct = Math.round(stableConfidence * 100);

  const handleSpeakManual = () => {
    if (stableGesture && stableGesture !== "none") {
      audioManager.playGestureAudio(stableGesture, true);
    }
  };

  // Top 4 probabilities
  const topProbabilities = rawPrediction?.allProbabilities
    ? Object.entries(rawPrediction.allProbabilities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
    : [];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-colors">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Real-Time Recognized Gesture
          </span>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              stableGesture !== "none"
                ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
            }`}
          >
            {stableGesture !== "none" ? "Gesture Detected" : "Idle"}
          </span>
        </div>

        {/* Main Recognized Title */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentConfig.name}
          </h2>

          {stableGesture !== "none" && (
            <button
              onClick={handleSpeakManual}
              title="Play Audio Speech"
              className="w-12 h-12 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-yellow-400/30 hover:scale-105 transition-all"
            >
              <Volume2 className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 min-h-[40px]">
          {currentConfig.description}
        </p>
      </div>

      {/* Confidence Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-600 dark:text-slate-300">Confidence Score</span>
          <span className="text-yellow-600 dark:text-yellow-400 font-mono text-sm">
            {confidencePct}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Top Probabilities Distribution */}
      {topProbabilities.length > 0 && isCameraActive && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Top Class Probabilities
          </h4>
          <div className="space-y-2">
            {topProbabilities.map(([cls, prob]) => {
              const labelName = GESTURE_CONFIG[cls]?.name || cls;
              const pct = Math.round(prob * 100);
              return (
                <div key={cls} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                    {labelName}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-slate-500 dark:text-slate-400 w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

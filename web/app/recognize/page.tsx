"use client";

import React, { useState } from "react";
import { CameraView } from "@/components/camera/CameraView";
import { PredictionCard } from "@/components/recognition/PredictionCard";
import { useCamera } from "@/hooks/useCamera";
import { useInference } from "@/hooks/useInference";
import { useSettings } from "@/contexts/SettingsContext";
import { useModel } from "@/contexts/ModelContext";
import { Sliders, Volume2, VolumeX, RefreshCw, Cpu } from "lucide-react";

export default function RecognizePage() {
  const { settings, updateSettings } = useSettings();
  const { status: modelStatus, backend, error: modelError, reloadModel } = useModel();

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(settings.selectedCameraId);

  const {
    videoRef,
    status: cameraStatus,
    devices,
    errorMsg: cameraErrorMsg,
    videoDimensions,
    startCamera,
    stopCamera,
  } = useCamera(selectedDeviceId);

  const isCameraActive = cameraStatus === "active";

  const {
    rawPrediction,
    stableGesture,
    stableConfidence,
    actualFps,
    latencyMs,
  } = useInference(videoRef, isCameraActive);

  const handleSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    updateSettings({ selectedCameraId: deviceId });
    startCamera(deviceId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Real-Time Gesture Recognition
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Position your hand clearly in front of the camera for instant translation into spoken words.
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Cpu className="w-4 h-4 text-yellow-500" />
            <span>{modelStatus === "ready" ? `TF.js ${backend.toUpperCase()}` : "Model Loading..."}</span>
          </div>

          <button
            onClick={() => updateSettings({ audioEnabled: !settings.audioEnabled })}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              settings.audioEnabled
                ? "bg-yellow-400 text-slate-950 shadow-sm"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
            }`}
          >
            {settings.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{settings.audioEnabled ? "Audio On" : "Audio Muted"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Camera View */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <CameraView
            videoRef={videoRef}
            status={cameraStatus}
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            errorMsg={cameraErrorMsg}
            videoDimensions={videoDimensions}
            actualFps={actualFps}
            latencyMs={latencyMs}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
            onSelectDevice={handleSelectDevice}
          />

          {/* Quick Settings Control Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Sliders className="w-4 h-4 text-yellow-500" />
              <span>Confidence Threshold:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.round(settings.confidenceThreshold * 100)}%
              </span>
            </div>

            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={settings.confidenceThreshold}
              onChange={(e) => updateSettings({ confidenceThreshold: parseFloat(e.target.value) })}
              className="w-32 accent-yellow-400"
            />

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span>Target FPS:</span>
              <select
                value={settings.targetFps}
                onChange={(e) => updateSettings({ targetFps: parseInt(e.target.value) })}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
              >
                <option value={5}>5 FPS</option>
                <option value={10}>10 FPS</option>
                <option value={15}>15 FPS</option>
                <option value={20}>20 FPS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Recognized Card */}
        <div className="lg:col-span-5">
          <PredictionCard
            rawPrediction={rawPrediction}
            stableGesture={stableGesture}
            stableConfidence={stableConfidence}
            isCameraActive={isCameraActive}
          />
        </div>
      </div>
    </div>
  );
}

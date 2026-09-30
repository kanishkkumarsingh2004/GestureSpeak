"use client";

import React from "react";
import { Camera, CameraOff, RefreshCw, AlertCircle, Video } from "lucide-react";
import { CameraDevice, CameraStatus } from "@/hooks/useCamera";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  devices: CameraDevice[];
  selectedDeviceId: string;
  errorMsg: string | null;
  videoDimensions: { width: number; height: number };
  actualFps: number;
  latencyMs: number;
  onStartCamera: (deviceId?: string) => void;
  onStopCamera: () => void;
  onSelectDevice: (deviceId: string) => void;
}

export function CameraView({
  videoRef,
  status,
  devices,
  selectedDeviceId,
  errorMsg,
  videoDimensions,
  actualFps,
  latencyMs,
  onStartCamera,
  onStopCamera,
  onSelectDevice,
}: CameraViewProps) {
  return (
    <div className="relative w-full aspect-video rounded-3xl bg-slate-950 overflow-hidden border border-slate-800 shadow-xl group">
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
          status === "active" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Overlay when Camera is Stopped / Idle */}
      {status !== "active" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 backdrop-blur-sm z-10">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 flex items-center justify-center mb-4 shadow-lg shadow-yellow-400/5">
            <Video className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Camera Feed Inactive</h3>

          {errorMsg ? (
            <div className="flex items-center gap-2 text-rose-400 text-sm max-w-md bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <p className="text-slate-400 text-sm max-w-md mb-6">
              Click below to enable your camera and begin real-time hand gesture recognition.
            </p>
          )}

          <button
            onClick={() => onStartCamera()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold shadow-lg shadow-yellow-400/25 hover:scale-105 transition-all"
          >
            <Camera className="w-5 h-5" />
            <span>Start Camera</span>
          </button>
        </div>
      )}

      {/* HUD Header Bar when active */}
      {status === "active" && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-white pointer-events-auto shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>LIVE</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">
              {videoDimensions.width}x{videoDimensions.height}
            </span>
          </div>

          {/* Performance HUD */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-mono font-medium text-slate-200 pointer-events-auto shadow-md">
            <span>{actualFps} FPS</span>
            <span className="text-slate-500">•</span>
            <span className="text-yellow-400">{latencyMs.toFixed(1)} ms</span>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar when active */}
      {status === "active" && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 z-20 transition-opacity">
          {/* Device Selector */}
          {devices.length > 1 ? (
            <select
              value={selectedDeviceId}
              onChange={(e) => onSelectDevice(e.target.value)}
              className="bg-slate-800 text-white text-xs font-medium rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs font-medium text-slate-400 px-2">Front Camera</span>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStartCamera()}
              title="Restart Camera"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onStopCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

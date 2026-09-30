"use client";

import React from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { Sliders, Volume2, Camera, Cpu, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Application Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Customize camera, inference rate, confidence threshold, and audio parameters.
          </p>
        </div>

        <button
          onClick={resetSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Inference Settings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/15 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inference & Thresholds</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Control real-time model sampling rate and minimum confidence</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Confidence Threshold */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-slate-700 dark:text-slate-300">Minimum Confidence Threshold</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-mono font-bold">
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
                className="w-full accent-yellow-400"
              />
              <p className="text-xs text-slate-400 mt-1">
                Higher threshold reduces false positives but requires clearer hand postures.
              </p>
            </div>

            {/* Target FPS */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Target Inference Speed (FPS)
              </label>
              <select
                value={settings.targetFps}
                onChange={(e) => updateSettings({ targetFps: parseInt(e.target.value) })}
                className="w-full max-w-xs px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value={5}>5 FPS (Low CPU usage)</option>
                <option value={10}>10 FPS (Recommended balance)</option>
                <option value={15}>15 FPS (High responsiveness)</option>
                <option value={20}>20 FPS (Ultra fast)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/15 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Audio & Speech</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure speech translation playback</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Enable Spoken Speech</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Automatically speak recognized gesture name out loud</p>
              </div>
              <input
                type="checkbox"
                checked={settings.audioEnabled}
                onChange={(e) => updateSettings({ audioEnabled: e.target.checked })}
                className="w-5 h-5 accent-yellow-400 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span className="text-slate-700 dark:text-slate-300">Speech Volume</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-mono font-bold">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                className="w-full accent-yellow-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

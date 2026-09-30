"use client";

import React, { useState } from "react";
import { GESTURE_CONFIG } from "@/config/gestures";
import { audioManager } from "@/services/audio/audio-manager";
import { Search, Volume2, Hand, Filter } from "lucide-react";

export default function GesturesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const gestureList = Object.values(GESTURE_CONFIG).filter((g) => g.id !== "none");

  const filteredGestures = gestureList.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || g.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handlePlayAudio = (gestureId: string) => {
    audioManager.playGestureAudio(gestureId, true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Gesture Library
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Explore all 16 supported hand gesture postures, posture instructions, and spoken speech translations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {["all", "number", "action", "communication"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-yellow-400 text-slate-950 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search gesture..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {/* Gesture Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGestures.map((g) => (
          <div
            key={g.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="w-10 h-10 rounded-xl bg-yellow-400/15 text-yellow-600 dark:text-yellow-400 flex items-center justify-center font-bold">
                  <Hand className="w-5 h-5 stroke-[2.5]" />
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                  {g.category}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {g.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {g.description}
              </p>
            </div>

            <button
              onClick={() => handlePlayAudio(g.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs shadow-md shadow-yellow-400/20 group-hover:scale-[1.02] transition-all"
            >
              <Volume2 className="w-4 h-4 stroke-[2.5]" />
              <span>Test Speech: "{g.audioText}"</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

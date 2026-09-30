"use client";

import Link from "next/link";
import { Hand, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="w-6 h-6 rounded-lg bg-yellow-400 flex items-center justify-center text-slate-950 font-bold">
            <Hand className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">GestureSpeak</span>
          <span>© {new Date().getFullYear()} — Client-side In-Browser Gesture Recognition</span>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/recognize" className="hover:text-yellow-600 dark:hover:text-yellow-400">
            Real-Time App
          </Link>
          <Link href="/gestures" className="hover:text-yellow-600 dark:hover:text-yellow-400">
            Gesture Library
          </Link>
          <Link href="/model" className="hover:text-yellow-600 dark:hover:text-yellow-400">
            Model Specs
          </Link>
        </div>
      </div>
    </footer>
  );
}

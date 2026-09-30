import Link from "next/link";
import { Camera, Sparkles, Zap, Shield, Volume2, ArrowRight, Hand, Cpu, Layers } from "lucide-react";
import { GESTURE_CONFIG } from "@/config/gestures";

export default function HomePage() {
  const featuredGestures = Object.values(GESTURE_CONFIG).filter(g => g.id !== "none").slice(0, 6);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-yellow-500/10 via-white to-white dark:from-yellow-500/5 dark:via-slate-950 dark:to-slate-950 pt-20 pb-16 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 border border-yellow-400/30 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in shadow-sm">
            <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span>100% In-Browser Real-Time Inference</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
            Turn Hand Gestures into <span className="text-yellow-500 dark:text-yellow-400 underline decoration-yellow-400/50 underline-offset-8">Spoken Speech</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            GestureSpeak uses TensorFlow.js and custom VGG16 neural networks to recognize 16 hand gestures in real-time right inside your web browser. No cloud API required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href="/recognize"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-base shadow-xl shadow-yellow-400/25 hover:scale-105 transition-all"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>Start Recognizing</span>
            </Link>

            <Link
              href="/gestures"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-base transition-colors"
            >
              <span>Explore Gestures</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
            How GestureSpeak Works
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Three simple steps powered entirely on your device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-yellow-400/20">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Webcam Input</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Captures live video frames directly from your camera at 10-20 FPS.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-yellow-400/20">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">VGG16 Neural Model</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              TensorFlow.js preprocesses RGB frames and runs WebGL/WebGPU deep neural inference.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-slate-950 flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-yellow-400/20">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Instant Speech Output</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Temporal prediction smoother translates posture into clear audio speech playback.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Gestures Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Supported Gesture Library</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">16 gesture posture classes recognized out of the box</p>
          </div>
          <Link href="/gestures" className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 hover:underline flex items-center gap-1">
            <span>View All Gestures</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGestures.map((g) => (
            <div key={g.id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{g.name}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                  {g.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {g.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                <Volume2 className="w-4 h-4" />
                <span>Audio: "{g.audioText}"</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

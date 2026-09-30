"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hand, Camera, BookOpen, Cpu, Settings, Sparkles } from "lucide-react";
import { useModel } from "@/contexts/ModelContext";

export function Navbar() {
  const pathname = usePathname();
  const { status, backend } = useModel();

  const navItems = [
    { href: "/", label: "Home", icon: Hand },
    { href: "/recognize", label: "Recognize", icon: Camera },
    { href: "/gestures", label: "Gestures", icon: BookOpen },
    { href: "/model", label: "Model Info", icon: Cpu },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 group-hover:bg-yellow-300 transition-all flex items-center justify-center text-slate-950 font-black shadow-md shadow-yellow-400/30">
            <Hand className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-yellow-500 transition-colors">
              GestureSpeak
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border border-yellow-400/30">
              AI Real-Time
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-yellow-400 text-slate-950 font-semibold shadow-sm shadow-yellow-400/20"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Model Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
          <span
            className={`w-2 h-2 rounded-full ${
              status === "ready"
                ? "bg-emerald-500 animate-pulse"
                : status === "loading"
                ? "bg-yellow-500 animate-bounce"
                : "bg-rose-500"
            }`}
          />
          <span className="capitalize text-slate-700 dark:text-slate-200">
            {status === "ready" ? `TF.js (${backend.toUpperCase()})` : status}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
        </div>
      </div>
    </header>
  );
}

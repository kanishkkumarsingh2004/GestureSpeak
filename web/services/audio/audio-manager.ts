"use client";

import { Howl } from "howler";
import { GESTURE_CONFIG } from "@/config/gestures";

class AudioManager {
  private sounds: Record<string, Howl> = {};
  private isEnabled = true;
  private volume = 0.9;
  private lastSpokenTime = 0;

  constructor() {
    if (typeof window !== "undefined") {
      this.preloadAudioClips();
    }
  }

  private preloadAudioClips() {
    Object.entries(GESTURE_CONFIG).forEach(([id, cfg]) => {
      if (cfg.audioPath && cfg.id !== "none") {
        this.sounds[id] = new Howl({
          src: [cfg.audioPath],
          volume: this.volume,
          preload: false,
          onloaderror: () => {
            // Silently handle missing mp3 by using SpeechSynthesis fallback
          },
        });
      }
    });
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach((sound) => sound.volume(this.volume));
  }

  public playGestureAudio(gestureId: string, force = false) {
    if (!this.isEnabled && !force) return;
    if (gestureId === "none" || !gestureId) return;

    const now = Date.now();
    // Prevent double triggers within 600ms unless forced
    if (!force && now - this.lastSpokenTime < 600) return;
    this.lastSpokenTime = now;

    const config = GESTURE_CONFIG[gestureId];
    const textToSpeak = config?.audioText || gestureId;

    // Web Speech API fallback for zero-latency speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel(); // cancel pending speech
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.volume = this.volume;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn("SpeechSynthesis error, falling back to audio clip:", err);
      }
    }

    // First attempt to play howler audio clip if loaded
    const sound = this.sounds[gestureId];
    if (sound) {
      if (sound.state() === "loaded") {
        sound.play();
      } else if (sound.state() === "unloaded") {
        sound.load();
      }
    }
  }
}

export const audioManager = new AudioManager();

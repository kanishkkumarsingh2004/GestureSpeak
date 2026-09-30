import { GesturePrediction } from "@/services/gesture-model/types";

export interface SmootherOptions {
  bufferSize?: number;
  confidenceThreshold?: number;
  minimumStableFrames?: number;
  cooldownMs?: number;
}

export class PredictionSmoother {
  private buffer: GesturePrediction[] = [];
  private bufferSize: number;
  private confidenceThreshold: number;
  private minimumStableFrames: number;
  private cooldownMs: number;
  private lastAcceptedGesture: string = "none";
  private lastAcceptedAt: number = 0;

  constructor(options: SmootherOptions = {}) {
    this.bufferSize = options.bufferSize ?? 8;
    this.confidenceThreshold = options.confidenceThreshold ?? 0.75;
    this.minimumStableFrames = options.minimumStableFrames ?? 4;
    this.cooldownMs = options.cooldownMs ?? 800;
  }

  public updateSettings(options: SmootherOptions) {
    if (options.confidenceThreshold !== undefined) {
      this.confidenceThreshold = options.confidenceThreshold;
    }
    if (options.bufferSize !== undefined) {
      this.bufferSize = options.bufferSize;
    }
  }

  public push(prediction: GesturePrediction): {
    stableGesture: string;
    isNewTrigger: boolean;
    confidence: number;
  } {
    this.buffer.push(prediction);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }

    // Filter frames passing confidence threshold
    const validFrames = this.buffer.filter(
      (p) => p.confidence >= this.confidenceThreshold && p.gesture !== "none"
    );

    if (validFrames.length < this.minimumStableFrames) {
      return {
        stableGesture: "none",
        isNewTrigger: false,
        confidence: prediction.confidence,
      };
    }

    // Majority vote among valid frames
    const counts: Record<string, { count: number; maxConf: number }> = {};
    validFrames.forEach((p) => {
      if (!counts[p.gesture]) {
        counts[p.gesture] = { count: 0, maxConf: 0 };
      }
      counts[p.gesture].count += 1;
      counts[p.gesture].maxConf = Math.max(counts[p.gesture].maxConf, p.confidence);
    });

    const sorted = Object.entries(counts).sort(
      (a, b) => b[1].count - a[1].count || b[1].maxConf - a[1].maxConf
    );

    const winnerGesture = sorted[0][0];
    const winnerStats = sorted[0][1];

    const now = Date.now();
    const isSameGesture = winnerGesture === this.lastAcceptedGesture;
    const isWithinCooldown = now - this.lastAcceptedAt < this.cooldownMs;

    if (isSameGesture && isWithinCooldown) {
      return {
        stableGesture: winnerGesture,
        isNewTrigger: false,
        confidence: winnerStats.maxConf,
      };
    }

    this.lastAcceptedGesture = winnerGesture;
    this.lastAcceptedAt = now;

    return {
      stableGesture: winnerGesture,
      isNewTrigger: true,
      confidence: winnerStats.maxConf,
    };
  }

  public reset() {
    this.buffer = [];
    this.lastAcceptedGesture = "none";
    this.lastAcceptedAt = 0;
  }
}

export interface GesturePrediction {
  classId: number;
  gesture: string;
  label: string;
  confidence: number;
  allProbabilities: Record<string, number>;
  inferenceTimeMs: number;
  timestamp: number;
}

export type ModelStatus = "idle" | "loading" | "ready" | "error";

export interface ModelMetadata {
  modelName: string;
  version: string;
  architecture: string;
  inputShape: number[];
  numClasses: number;
  preprocessing: string;
  framework: string;
  runtime: string;
}

import * as tf from "@tensorflow/tfjs";
import { GesturePrediction } from "./types";
import { GESTURE_CONFIG } from "@/config/gestures";

export function runInference(
  model: tf.LayersModel,
  inputTensor: tf.Tensor4D,
  classesMap: Record<string, string>
): GesturePrediction {
  const t0 = performance.now();
  
  const predictions = tf.tidy(() => {
    const output = model.predict(inputTensor) as tf.Tensor;
    return output.dataSync(); // Float32Array of softmax probabilities
  });
  
  const inferenceTimeMs = performance.now() - t0;

  // Find class index with max confidence
  let maxIdx = 0;
  let maxConf = 0;
  const allProbabilities: Record<string, number> = {};

  for (let i = 0; i < predictions.length; i++) {
    const classId = classesMap[i.toString()] || i.toString();
    const prob = predictions[i];
    allProbabilities[classId] = prob;

    if (prob > maxConf) {
      maxConf = prob;
      maxIdx = i;
    }
  }

  const gesture = classesMap[maxIdx.toString()] || "none";
  const label = GESTURE_CONFIG[gesture]?.name || gesture;

  return {
    classId: maxIdx,
    gesture,
    label,
    confidence: maxConf,
    allProbabilities,
    inferenceTimeMs,
    timestamp: Date.now(),
  };
}

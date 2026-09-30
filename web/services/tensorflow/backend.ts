import * as tf from "@tensorflow/tfjs";

export async function initTensorFlowBackend(): Promise<string> {
  await tf.ready();
  
  // Try WebGL backend for high-performance GPU execution
  try {
    if (tf.getBackend() !== "webgl") {
      await tf.setBackend("webgl");
    }
  } catch (e) {
    console.warn("WebGL backend unavailable, falling back to default:", e);
  }

  return tf.getBackend();
}

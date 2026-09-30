import * as tf from "@tensorflow/tfjs";

export function preprocessFrame(videoElement: HTMLVideoElement): tf.Tensor4D {
  return tf.tidy(() => {
    // 1. Convert video frame to 3D Tensor [H, W, 3] in RGB format (0..255)
    const rawTensor = tf.browser.fromPixels(videoElement);
    
    // 2. Resize to VGG16 target size (224x224)
    const resized = tf.image.resizeBilinear(rawTensor, [224, 224]);
    
    // 3. Convert to Float32
    const floatTensor = resized.toFloat();
    
    // 4. VGG16 preprocess_input: RGB -> BGR channel reversal
    const bgrTensor = floatTensor.reverse(-1);
    
    // 5. Subtract ImageNet BGR channel means [103.939, 116.779, 123.68]
    const imagenetMeansBGR = tf.tensor1d([103.939, 116.779, 123.68]);
    const normalized = bgrTensor.sub(imagenetMeansBGR);
    
    // 6. Expand batch dimension -> [1, 224, 224, 3]
    return normalized.expandDims(0) as tf.Tensor4D;
  });
}

"""
GestureSpeak Preprocessing Module
Implements standard VGG16 preprocessing matching TensorFlow and Browser.
"""
import tensorflow as tf

def preprocess_vgg16(image: tf.Tensor) -> tf.Tensor:
    """
    Preprocesses an RGB image tensor for VGG16:
    1. Expects float image in range [0, 255]
    2. Converts RGB -> BGR
    3. Subtracts ImageNet channel means: B: 103.939, G: 116.779, R: 123.68
    """
    return tf.keras.applications.vgg16.preprocess_input(image)

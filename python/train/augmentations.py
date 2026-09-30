"""
GestureSpeak Data Augmentation Pipeline
"""
import tensorflow as tf

def build_augmentation_layer() -> tf.keras.Sequential:
    """
    Creates a tf.keras data augmentation pipeline.
    Applies small random rotations, zooms, and contrast variations.
    Does NOT use horizontal flip for gestures where hand orientation matters.
    """
    return tf.keras.Sequential([
        tf.keras.layers.RandomRotation(0.08, fill_mode="nearest"),
        tf.keras.layers.RandomZoom((-0.1, 0.1), fill_mode="nearest"),
        tf.keras.layers.RandomContrast(0.15),
        tf.keras.layers.RandomBrightness(0.15),
    ], name="data_augmentation")

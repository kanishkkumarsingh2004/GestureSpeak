"""
GestureSpeak Model Architecture Module
VGG16 Transfer Learning for Hand Gesture Classification.
"""
import tensorflow as tf

from train.config import INPUT_SHAPE, DENSE_UNITS, DROPOUT_RATE

def build_model(num_classes: int) -> tf.keras.Model:
    """
    Builds a VGG16 classification model with a custom dense head.
    The backbone is initialized with ImageNet weights and frozen initially.
    """
    base_model = tf.keras.applications.VGG16(
        include_top=False,
        weights="imagenet",
        input_shape=INPUT_SHAPE
    )
    base_model.trainable = False  # Freeze VGG16 backbone

    inputs = tf.keras.Input(shape=INPUT_SHAPE, name="input_image")
    x = base_model(inputs, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D(name="gap")(x)
    x = tf.keras.layers.Dense(DENSE_UNITS, activation="relu", name="dense_features")(x)
    x = tf.keras.layers.Dropout(DROPOUT_RATE, name="dropout")(x)
    outputs = tf.keras.layers.Dense(num_classes, activation="softmax", name="predictions")(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="GestureSpeak_VGG16")
    return model, base_model

def unfreeze_for_finetuning(model: tf.keras.Model, base_model: tf.keras.Model, unfreeze_from_layer: str = "block5_conv1"):
    """
    Unfreezes layers of the VGG16 base_model starting from `unfreeze_from_layer`.
    """
    base_model.trainable = True
    set_trainable = False
    for layer in base_model.layers:
        if layer.name == unfreeze_from_layer:
            set_trainable = True
        layer.trainable = set_trainable
    return model

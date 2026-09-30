"""
GestureSpeak Training Callbacks Module
"""
from pathlib import Path
import tensorflow as tf

from train.config import CHECKPOINT_DIR

def get_callbacks(model_name: str = "gesturespeak") -> list:
    """Returns list of Keras training callbacks: Checkpoint, EarlyStopping, ReduceLROnPlateau."""
    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
    checkpoint_filepath = CHECKPOINT_DIR / f"{model_name}_best.keras"

    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        filepath=str(checkpoint_filepath),
        monitor="val_loss",
        verbose=1,
        save_best_only=True,
        mode="min"
    )

    early_stopping = tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=6,
        restore_best_weights=True,
        verbose=1
    )

    reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=3,
        min_lr=1e-7,
        verbose=1
    )

    return [checkpoint, early_stopping, reduce_lr]

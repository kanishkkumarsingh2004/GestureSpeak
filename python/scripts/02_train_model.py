"""
GestureSpeak Model Training Script
Phase 2: Trains VGG16 transfer learning model with initial head training + fine-tuning.
Enforces CUDA GPU acceleration.
"""
import sys
from pathlib import Path

# Ensure python path includes train module and setup CUDA before TF import
sys.path.append(str(Path(__file__).resolve().parent.parent))
import train.cuda_setup

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.utils.class_weight import compute_class_weight

from train.config import (
    SPLITS_DIR,
    TRAINED_MODEL_PATH,
    NUM_CLASSES,
    ALL_CLASSES,
    EPOCHS_HEAD,
    EPOCHS_FINETUNE,
    LEARNING_RATE_HEAD,
    LEARNING_RATE_FINETUNE,
)
from train.dataset import create_dataset_from_csv, CLASS_TO_IDX
from train.model import build_model, unfreeze_for_finetuning
from train.callbacks import get_callbacks

def main():
    print("=== GestureSpeak Model Training ===")

    gpus = tf.config.list_physical_devices("GPU")
    if gpus:
        print(f"[CUDA GPU DETECTED] Using GPU: {gpus}")
        for gpu in gpus:
            try:
                tf.config.experimental.set_memory_growth(gpu, True)
            except RuntimeError as e:
                print(e)
    else:
        print("[WARNING] No CUDA GPU detected by TensorFlow. Running on CPU.")

    train_csv = SPLITS_DIR / "train.csv"
    val_csv = SPLITS_DIR / "val.csv"

    if not train_csv.exists() or not val_csv.exists():
        print("[ERROR] CSV splits not found. Please run 01_prepare_dataset.py first.")
        sys.exit(1)

    print("Loading datasets...")
    train_ds, n_train = create_dataset_from_csv(train_csv, is_training=True)
    val_ds, n_val = create_dataset_from_csv(val_csv, is_training=False)

    print(f"Train samples: {n_train}, Val samples: {n_val}")

    # Compute class weights to handle imbalanced gesture counts
    train_df = pd.read_csv(train_csv)
    labels = [CLASS_TO_IDX[l] for l in train_df["label"].values]
    unique_classes = np.unique(labels)
    weights = compute_class_weight(class_weight="balanced", classes=unique_classes, y=labels)
    class_weights = dict(zip(unique_classes, weights))
    print(f"Class weights computed: {class_weights}")

    print("\n--- Phase A: Head Training (VGG16 Frozen) ---")
    model, base_model = build_model(NUM_CLASSES)
    model.summary()

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE_HEAD),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    callbacks = get_callbacks("gesturespeak_head")

    history_head = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_HEAD,
        callbacks=callbacks,
        class_weight=class_weights
    )

    print("\n--- Phase B: Fine-Tuning (Unfreeze block5_conv1) ---")
    model = unfreeze_for_finetuning(model, base_model, unfreeze_from_layer="block5_conv1")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE_FINETUNE),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    callbacks_finetune = get_callbacks("gesturespeak_finetune")

    history_finetune = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_FINETUNE,
        callbacks=callbacks_finetune,
        class_weight=class_weights
    )

    # Save final trained model
    TRAINED_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save(str(TRAINED_MODEL_PATH))
    print(f"\nSuccessfully saved trained model to: {TRAINED_MODEL_PATH}")

if __name__ == "__main__":
    main()

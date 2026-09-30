"""
GestureSpeak Model Evaluation Script
Phase 3: Evaluates trained Keras model on unseen Test Set (Subject 5).
Generates classification metrics report and confusion matrix plot.
"""
import sys
import json
import time
import shutil
from pathlib import Path
import numpy as np
import pandas as pd
import tensorflow as tf
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix

# Ensure python path includes train module
sys.path.append(str(Path(__file__).resolve().parent.parent))

from train.config import (
    SPLITS_DIR,
    TRAINED_MODEL_PATH,
    METADATA_DIR,
    ALL_CLASSES,
)
from train.dataset import create_dataset_from_csv, CLASS_TO_IDX

def main():
    print("=== GestureSpeak Model Evaluation ===")

    test_csv = SPLITS_DIR / "test.csv"
    if not test_csv.exists() or not TRAINED_MODEL_PATH.exists():
        print("[ERROR] Test set or trained model missing.")
        sys.exit(1)

    print(f"Loading model from: {TRAINED_MODEL_PATH}")
    model = tf.keras.models.load_model(str(TRAINED_MODEL_PATH))

    print(f"Loading test dataset from: {test_csv}")
    test_ds, n_test = create_dataset_from_csv(test_csv, is_training=False, batch_size=32)

    # Collect ground truth labels and predictions
    y_true = []
    y_pred = []
    latencies = []

    for images, labels in test_ds:
        t0 = time.time()
        preds = model.predict(images, verbose=0)
        t1 = time.time()
        
        batch_latency = (t1 - t0) * 1000 / len(images) # ms per image
        latencies.append(batch_latency)

        y_true.extend(labels.numpy())
        y_pred.extend(np.argmax(preds, axis=1))

    mean_latency_ms = float(np.mean(latencies))

    # Explicit class indices matching ALL_CLASSES
    class_indices = list(range(len(ALL_CLASSES)))

    # Metrics with zero_division safety
    report = classification_report(
        y_true,
        y_pred,
        labels=class_indices,
        target_names=ALL_CLASSES,
        output_dict=True,
        zero_division=0
    )
    report_text = classification_report(
        y_true,
        y_pred,
        labels=class_indices,
        target_names=ALL_CLASSES,
        zero_division=0
    )

    print("\n=== Classification Report ===")
    print(report_text)
    print(f"Average Inference Latency per Image: {mean_latency_ms:.2f} ms")

    # Plot Confusion Matrix
    METADATA_DIR.mkdir(parents=True, exist_ok=True)
    cm = confusion_matrix(y_true, y_pred, labels=class_indices)
    
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt="d", cmap="YlGnBu", xticklabels=ALL_CLASSES, yticklabels=ALL_CLASSES)
    plt.title("GestureSpeak Confusion Matrix (Test Set: Subject 5)")
    plt.xlabel("Predicted Class")
    plt.ylabel("True Class")
    plt.tight_layout()
    
    cm_path = METADATA_DIR / "confusion_matrix.png"
    plt.savefig(cm_path)
    plt.close()
    print(f"Saved confusion matrix plot to: {cm_path}")

    # Save evaluation summary
    eval_metrics = {
        "accuracy": report["accuracy"],
        "macro_f1": report["macro avg"]["f1-score"],
        "weighted_f1": report["weighted avg"]["f1-score"],
        "latency_ms": mean_latency_ms,
        "per_class": {cls: report[cls] for cls in ALL_CLASSES if cls in report}
    }
    
    eval_path = METADATA_DIR / "evaluation.json"
    with open(eval_path, "w") as f:
        json.dump(eval_metrics, f, indent=2)
    print(f"Saved evaluation metrics to: {eval_path}")

    # Sync to web public folder
    web_public_model = Path(__file__).resolve().parent.parent.parent / "web" / "public" / "model"
    web_public_model.mkdir(parents=True, exist_ok=True)
    shutil.copy(eval_path, web_public_model / "evaluation.json")
    print(f"Synced evaluation.json to web public model folder.")

if __name__ == "__main__":
    main()

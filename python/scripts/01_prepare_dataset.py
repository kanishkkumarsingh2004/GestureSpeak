"""
GestureSpeak Dataset Preparation Script
Phase 1: Parses raw annotation files, crops/resizes hand gestures to 224x224,
handles corrupt images, collapses gesture classes, and generates train/val/test CSV splits.
"""
import os
import re
import sys
from pathlib import Path
import pandas as pd
import numpy as np
from PIL import Image
import traceback

# Ensure python path includes train module
sys.path.append(str(Path(__file__).resolve().parent.parent))

from train.config import (
    DATA_RAW_DIR,
    DATASET_PROCESSED_DIR,
    SPLITS_DIR,
    CLASS_MAPPING,
    ALL_CLASSES,
    IMAGE_SIZE,
)

def parse_box(box_str: str):
    """Parses bounding box string '[x y w h]' into integers (x, y, w, h)."""
    box_str = str(box_str).strip()
    if not box_str.startswith("[") or not box_str.endswith("]"):
        return 0, 0, 0, 0
    parts = box_str[1:-1].strip().split()
    if len(parts) != 4:
        return 0, 0, 0, 0
    try:
        return int(parts[0]), int(parts[1]), int(parts[2]), int(parts[3])
    except ValueError:
        return 0, 0, 0, 0

def process_subject(subject_num: int):
    """
    Processes annotations and images for a given subject (1 to 5).
    Returns a list of dicts: [{'path': str, 'label': str, 'subject': int}, ...]
    """
    subj_name = f"Subject{subject_num}"
    txt_path = DATA_RAW_DIR / subj_name / f"{subj_name}.txt"
    img_dir = DATA_RAW_DIR / subj_name / subj_name

    if not txt_path.exists():
        print(f"[WARN] Annotation file not found: {txt_path}")
        return []

    df = pd.read_csv(txt_path)
    df.columns = [c.strip() for c in df.columns]

    processed_samples = []
    print(f"\nProcessing {subj_name} ({len(df)} rows)...")

    # Column mapping for gestures
    gesture_cols = [c for c in df.columns if c not in ("rgb", "depth")]

    for idx, row in df.iterrows():
        rgb_rel = str(row["rgb"])
        match = re.search(r"(\d+)_color\.png", rgb_rel, re.IGNORECASE)
        if not match:
            continue
        frame_id = match.group(1)
        img_path = img_dir / f"{frame_id}_color.png"

        if not img_path.exists():
            continue

        # Open image safely
        try:
            with Image.open(img_path) as img:
                img = img.convert("RGB")
                w_img, h_img = img.size

                has_gesture = False
                for col in gesture_cols:
                    if col not in CLASS_MAPPING:
                        continue
                    
                    x, y, w, h = parse_box(row[col])
                    if w <= 0 or h <= 0:
                        continue

                    has_gesture = True
                    target_class = CLASS_MAPPING[col]

                    # 15% padding
                    pad_w = int(w * 0.15)
                    pad_h = int(h * 0.15)

                    x1 = max(0, x - pad_w)
                    y1 = max(0, y - pad_h)
                    x2 = min(w_img, x + w + pad_w)
                    y2 = min(h_img, y + h + pad_h)

                    if x2 - x1 < 5 or y2 - y1 < 5:
                        continue

                    crop = img.crop((x1, y1, x2, y2))
                    crop_resized = crop.resize(IMAGE_SIZE, Image.Resampling.BILINEAR)

                    out_dir = DATASET_PROCESSED_DIR / target_class
                    out_dir.mkdir(parents=True, exist_ok=True)

                    out_filename = f"{subj_name}_{frame_id}_{col}.png"
                    out_path = out_dir / out_filename
                    crop_resized.save(out_path)

                    processed_samples.append({
                        "path": str(out_path),
                        "label": target_class,
                        "subject": subject_num
                    })

                # If no gesture in this frame, save to 'none' class
                if not has_gesture:
                    target_class = "none"
                    out_dir = DATASET_PROCESSED_DIR / target_class
                    out_dir.mkdir(parents=True, exist_ok=True)

                    out_filename = f"{subj_name}_{frame_id}_none.png"
                    out_path = out_dir / out_filename
                    
                    # Center crop frame for 'none' class
                    crop_size = min(w_img, h_img)
                    cx1 = (w_img - crop_size) // 2
                    cy1 = (h_img - crop_size) // 2
                    crop = img.crop((cx1, cy1, cx1 + crop_size, cy1 + crop_size))
                    crop_resized = crop.resize(IMAGE_SIZE, Image.Resampling.BILINEAR)
                    crop_resized.save(out_path)

                    processed_samples.append({
                        "path": str(out_path),
                        "label": target_class,
                        "subject": subject_num
                    })

        except Exception as e:
            print(f"[WARN] Failed to process image {img_path}: {e}")
            continue

    return processed_samples

def main():
    print("=== GestureSpeak Dataset Preparation ===")
    DATASET_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    SPLITS_DIR.mkdir(parents=True, exist_ok=True)

    all_samples = []
    for subj in range(1, 6):
        samples = process_subject(subj)
        all_samples.extend(samples)

    if not all_samples:
        print("[ERROR] No samples processed!")
        sys.exit(1)

    df = pd.DataFrame(all_samples)
    print("\nTotal Processed Samples:", len(df))
    print("\nClass Distribution:")
    print(df["label"].value_counts())

    # Subject-Aware Split
    # Train: Subject 3 & 4
    # Val:   Subject 1 & 2
    # Test:  Subject 5
    train_df = df[df["subject"].isin([3, 4])].copy()
    val_df = df[df["subject"].isin([1, 2])].copy()
    test_df = df[df["subject"] == 5].copy()

    # Save CSVs
    train_csv = SPLITS_DIR / "train.csv"
    val_csv = SPLITS_DIR / "val.csv"
    test_csv = SPLITS_DIR / "test.csv"

    train_df.to_csv(train_csv, index=False)
    val_df.to_csv(val_csv, index=False)
    test_df.to_csv(test_csv, index=False)

    print("\n=== Dataset Splits Created ===")
    print(f"Train samples (Subject 3 & 4): {len(train_df)} -> {train_csv}")
    print(f"Val samples   (Subject 1 & 2): {len(val_df)} -> {val_csv}")
    print(f"Test samples  (Subject 5)    : {len(test_df)} -> {test_csv}")

if __name__ == "__main__":
    main()

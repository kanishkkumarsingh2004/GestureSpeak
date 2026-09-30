"""
GestureSpeak Configuration Module
Centralizes all dataset, training, and model parameters.
"""
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_RAW_DIR = BASE_DIR.parent / "data"
DATASET_PROCESSED_DIR = BASE_DIR / "dataset" / "processed"
SPLITS_DIR = BASE_DIR / "dataset" / "splits"

CHECKPOINT_DIR = BASE_DIR / "model" / "checkpoints"
TRAINED_MODEL_PATH = BASE_DIR / "model" / "trained" / "gesturespeak.keras"
TFJS_MODEL_DIR = BASE_DIR / "model" / "tensorflowjs"
METADATA_DIR = BASE_DIR / "model" / "metadata"

# Image parameters
IMAGE_SIZE = (224, 224)
INPUT_SHAPE = (224, 224, 3)

# Training Hyperparameters (Reduced batch size to prevent OOM/system crashes)
BATCH_SIZE = 16
EPOCHS_HEAD = 20
EPOCHS_FINETUNE = 15
LEARNING_RATE_HEAD = 1e-3
LEARNING_RATE_FINETUNE = 1e-5
DROPOUT_RATE = 0.5
DENSE_UNITS = 128

# Class Definitions (Collapsed VFR/VFL and Horiz variants)
CLASS_MAPPING = {
    "Punch_VFR": "punch",
    "Punch_VFL": "punch",
    "One_VFR": "one",
    "One_VFL": "one",
    "Two_VFR": "two",
    "Two_VFL": "two",
    "Three_VFR": "three",
    "Three_VFL": "three",
    "Four_VFR": "four",
    "Four_VFL": "four",
    "Five_VFR": "five",
    "Five_VFL": "five",
    "Six_VFR": "six",
    "Six_VFL": "six",
    "Seven_VFR": "seven",
    "Seven_VFL": "seven",
    "Eight_VFR": "eight",
    "Eight_VFL": "eight",
    "Nine_VFR": "nine",
    "Nine_VFL": "nine",
    "Span_VFR": "span",
    "Span_VFL": "span",
    "Horiz_HBL": "horizontal",
    "Horiz_HFL": "horizontal",
    "Horiz_HBR": "horizontal",
    "Horiz_HFR": "horizontal",
    "Collab": "collab",
    "XSign": "xsign",
    "TimeOut": "timeout",
}

ALL_CLASSES = [
    "punch",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "span",
    "horizontal",
    "collab",
    "xsign",
    "timeout",
    "none",
]

NUM_CLASSES = len(ALL_CLASSES)

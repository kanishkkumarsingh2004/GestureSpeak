"""
GestureSpeak tf.data.Dataset Builder
Loads images from CSV split files and applies preprocessing + augmentations using native TensorFlow ops.
"""
from pathlib import Path
import pandas as pd
import tensorflow as tf

from train.config import IMAGE_SIZE, BATCH_SIZE, ALL_CLASSES
from train.preprocessing import preprocess_vgg16
from train.augmentations import build_augmentation_layer

# Map class names to integer indices
CLASS_TO_IDX = {name: i for i, name in enumerate(ALL_CLASSES)}

def load_and_preprocess_image(path_tensor, label_tensor, is_training: bool = False, augment_layer=None):
    """Native TF graph loading, decoding, resizing, and preprocessing function."""
    img_bytes = tf.io.read_file(path_tensor)
    img = tf.image.decode_png(img_bytes, channels=3)
    img = tf.image.resize(img, IMAGE_SIZE)
    
    if is_training and augment_layer is not None:
        img = augment_layer(img)
        
    img = preprocess_vgg16(img)
    return img, label_tensor

def create_dataset_from_csv(
    csv_path: Path,
    is_training: bool = False,
    batch_size: int = BATCH_SIZE,
    shuffle_buffer: int = 2000
) -> tuple[tf.data.Dataset, int]:
    """Creates a tf.data.Dataset given a CSV file containing 'path' and 'label' columns."""
    df = pd.read_csv(csv_path)
    paths = df["path"].values
    labels = [CLASS_TO_IDX[l] for l in df["label"].values]

    dataset = tf.data.Dataset.from_tensor_slices((paths, labels))
    
    augment_layer = build_augmentation_layer() if is_training else None

    if is_training:
        dataset = dataset.shuffle(buffer_size=min(len(paths), shuffle_buffer))
        
    dataset = dataset.map(
        lambda p, l: load_and_preprocess_image(p, l, is_training, augment_layer),
        num_parallel_calls=tf.data.AUTOTUNE
    )
    
    # Cache processed images in memory after first pass
    dataset = dataset.cache()
    dataset = dataset.batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return dataset, len(df)

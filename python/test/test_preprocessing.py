"""
Unit tests for GestureSpeak preprocessing module
"""
import numpy as np
import tensorflow as tf
from train.preprocessing import preprocess_vgg16

def test_preprocess_vgg16_shape_and_range():
    # Create dummy RGB image (224, 224, 3) with values in [0, 255]
    img = np.ones((224, 224, 3), dtype=np.float32) * 128.0
    tensor = tf.convert_to_tensor(img)
    processed = preprocess_vgg16(tensor)
    
    assert processed.shape == (224, 224, 3)
    # Check that channel mean subtraction was applied (BGR format)
    # Original 128 - BGR means [103.939, 116.779, 123.68]
    np.testing.assert_allclose(processed[0, 0, 0], 128.0 - 103.939, atol=1e-2)
    np.testing.assert_allclose(processed[0, 0, 1], 128.0 - 116.779, atol=1e-2)
    np.testing.assert_allclose(processed[0, 0, 2], 128.0 - 123.68, atol=1e-2)

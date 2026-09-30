"""
Unit tests for GestureSpeak model module
"""
import numpy as np
import tensorflow as tf
from train.model import build_model
from train.config import NUM_CLASSES, INPUT_SHAPE

def test_build_model_output_shape_and_softmax():
    model, base_model = build_model(NUM_CLASSES)
    
    dummy_input = np.zeros((1, *INPUT_SHAPE), dtype=np.float32)
    output = model(dummy_input)
    
    assert output.shape == (1, NUM_CLASSES)
    # Verify softmax sums to 1.0
    sum_prob = np.sum(output.numpy())
    np.testing.assert_allclose(sum_prob, 1.0, atol=1e-4)

"""
GestureSpeak TensorFlow.js Exporter
Phase 4: Converts trained Keras model into TF.js artifacts and syncs metadata to web/public/model/
"""
import sys
import json
import shutil
from pathlib import Path
import tensorflow as tf
import tensorflowjs as tfjs

# Ensure python path includes train module
sys.path.append(str(Path(__file__).resolve().parent.parent))

from train.config import (
    TRAINED_MODEL_PATH,
    TFJS_MODEL_DIR,
    METADATA_DIR,
    ALL_CLASSES,
    IMAGE_SIZE,
    NUM_CLASSES,
)

def main():
    print("=== GestureSpeak TensorFlow.js Export ===")

    if not TRAINED_MODEL_PATH.exists():
        print(f"[ERROR] Trained model file not found at: {TRAINED_MODEL_PATH}")
        sys.exit(1)

    TFJS_MODEL_DIR.mkdir(parents=True, exist_ok=True)
    METADATA_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Loading Keras model from {TRAINED_MODEL_PATH}...")
    model = tf.keras.models.load_model(str(TRAINED_MODEL_PATH))

    print(f"Converting model to TensorFlow.js format -> {TFJS_MODEL_DIR}...")
    tfjs.converters.save_keras_model(model, str(TFJS_MODEL_DIR))

    # Fix Keras 3 model topology format to Keras 2 schema for TF.js compatibility
    model_json_path = TFJS_MODEL_DIR / "model.json"
    if model_json_path.exists():
        with open(model_json_path, "r") as f:
            model_data = json.load(f)

        def fix_keras3_to_keras2(obj):
            if not isinstance(obj, dict):
                return obj

            if 'dtype' in obj and isinstance(obj['dtype'], dict) and 'config' in obj['dtype']:
                obj['dtype'] = obj['dtype']['config'].get('name', 'float32')

            if 'layers' in obj:
                if 'input_layers' in obj and isinstance(obj['input_layers'], list):
                    if len(obj['input_layers']) > 0 and not isinstance(obj['input_layers'][0], list):
                        obj['input_layers'] = [obj['input_layers']]
                if 'output_layers' in obj and isinstance(obj['output_layers'], list):
                    if len(obj['output_layers']) > 0 and not isinstance(obj['output_layers'][0], list):
                        obj['output_layers'] = [obj['output_layers']]

                for layer in obj['layers']:
                    if isinstance(layer.get('dtype'), dict) and 'config' in layer['dtype']:
                        layer['dtype'] = layer['dtype']['config'].get('name', 'float32')
                    if 'config' in layer and isinstance(layer['config'].get('dtype'), dict) and 'config' in layer['config']['dtype']:
                        layer['config']['dtype'] = layer['config']['dtype']['config'].get('name', 'float32')

                    if layer.get('class_name') == 'Functional' and 'config' in layer:
                        layer['config'] = fix_keras3_to_keras2(layer['config'])

                    if layer.get('class_name') == 'InputLayer' and 'config' in layer:
                        cfg = layer['config']
                        if 'batch_shape' in cfg and 'batch_input_shape' not in cfg:
                            cfg['batch_input_shape'] = cfg['batch_shape']
                        if 'batch_shape' in cfg and 'batchInputShape' not in cfg:
                            cfg['batchInputShape'] = cfg['batch_shape']

                    if 'inbound_nodes' in layer and isinstance(layer['inbound_nodes'], list):
                        new_inbound = []
                        for node in layer['inbound_nodes']:
                            if isinstance(node, dict) and 'args' in node:
                                converted_call = []
                                for arg in node['args']:
                                    if isinstance(arg, dict) and 'config' in arg and 'keras_history' in arg['config']:
                                        kh = arg['config']['keras_history']
                                        kwargs = node.get('kwargs', {})
                                        converted_call.append([kh[0], kh[1], kh[2], kwargs])
                                if converted_call:
                                    new_inbound.append(converted_call)
                            else:
                                new_inbound.append(node)
                        layer['inbound_nodes'] = new_inbound

            return obj

        if "modelTopology" in model_data and "model_config" in model_data["modelTopology"]:
            model_data["modelTopology"]["model_config"]["config"] = fix_keras3_to_keras2(
                model_data["modelTopology"]["model_config"]["config"]
            )
            with open(model_json_path, "w") as f:
                json.dump(model_data, f, indent=2)

    # Generate metadata files
    # 1. classes.json
    classes_json = {str(i): cls_name for i, cls_name in enumerate(ALL_CLASSES)}
    with open(METADATA_DIR / "classes.json", "w") as f:
        json.dump(classes_json, f, indent=2)

    # 2. metadata.json
    metadata_json = {
        "modelName": "gesturespeak-vgg16",
        "version": "1.0.0",
        "architecture": "VGG16",
        "inputShape": list(IMAGE_SIZE) + [3],
        "numClasses": NUM_CLASSES,
        "preprocessing": "vgg16",
        "framework": "tensorflow",
        "runtime": "tensorflowjs"
    }
    with open(METADATA_DIR / "metadata.json", "w") as f:
        json.dump(metadata_json, f, indent=2)

    # 3. preprocessing.json
    preprocessing_json = {
        "method": "vgg16",
        "resize": list(IMAGE_SIZE),
        "colorspace": "RGB",
        "normalization": "vgg16_preprocess_input",
        "channelOrder": "RGB",
        "imagenetMeansBGR": [103.939, 116.779, 123.68]
    }
    with open(METADATA_DIR / "preprocessing.json", "w") as f:
        json.dump(preprocessing_json, f, indent=2)

    print("=== Metadata Files Generated ===")

    # Sync to web/public/model/
    web_public_model = Path(__file__).resolve().parent.parent.parent / "web" / "public" / "model"
    web_public_model.mkdir(parents=True, exist_ok=True)

    print(f"Syncing model artifacts to web app: {web_public_model}")
    
    # Copy TF.js model files
    for item in TFJS_MODEL_DIR.glob("*"):
        if item.is_file():
            shutil.copy(item, web_public_model / item.name)

    # Copy Metadata files
    for item in METADATA_DIR.glob("*"):
        if item.is_file():
            shutil.copy(item, web_public_model / item.name)

    print("=== Export and Sync Completed Successfully! ===")

if __name__ == "__main__":
    main()

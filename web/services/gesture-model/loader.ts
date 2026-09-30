import * as tf from "@tensorflow/tfjs";
import { initTensorFlowBackend } from "../tensorflow/backend";
import { ModelMetadata } from "./types";

export interface LoadedModelBundle {
  model: tf.LayersModel;
  classes: Record<string, string>;
  metadata: ModelMetadata;
  backend: string;
}

function fixKeras3ToKeras2(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  if (obj.dtype && typeof obj.dtype === "object" && obj.dtype.config) {
    obj.dtype = obj.dtype.config.name || "float32";
  }

  if (Array.isArray(obj.layers)) {
    const inLayers = obj.input_layers || obj.inputLayers;
    if (Array.isArray(inLayers) && inLayers.length > 0 && !Array.isArray(inLayers[0])) {
      obj.input_layers = [inLayers];
      obj.inputLayers = [inLayers];
    }
    const outLayers = obj.output_layers || obj.outputLayers;
    if (Array.isArray(outLayers) && outLayers.length > 0 && !Array.isArray(outLayers[0])) {
      obj.output_layers = [outLayers];
      obj.outputLayers = [outLayers];
    }

    for (const layer of obj.layers) {
      if (layer.dtype && typeof layer.dtype === "object" && layer.dtype.config) {
        layer.dtype = layer.dtype.config.name || "float32";
      }
      if (layer.config && layer.config.dtype && typeof layer.config.dtype === "object" && layer.config.dtype.config) {
        layer.config.dtype = layer.config.dtype.config.name || "float32";
      }

      if ((layer.class_name === "Functional" || layer.class_name === "Model") && layer.config) {
        layer.config = fixKeras3ToKeras2(layer.config);
      }

      if (layer.class_name === "InputLayer" && layer.config) {
        const cfg = layer.config;
        const bShape = cfg.batch_shape || cfg.batch_input_shape || cfg.batchInputShape;
        if (bShape) {
          cfg.batch_input_shape = bShape;
          cfg.batchInputShape = bShape;
        }
      }

      const inbound = layer.inbound_nodes || layer.inboundNodes;
      if (Array.isArray(inbound)) {
        const newInbound: any[] = [];
        for (const node of inbound) {
          if (node && typeof node === "object" && !Array.isArray(node) && Array.isArray(node.args)) {
            const convertedCall: any[] = [];
            for (const arg of node.args) {
              if (arg && typeof arg === "object" && arg.config && Array.isArray(arg.config.keras_history)) {
                const kh = arg.config.keras_history;
                const kwargs = node.kwargs || {};
                convertedCall.push([kh[0], kh[1], kh[2], kwargs]);
              }
            }
            if (convertedCall.length > 0) {
              newInbound.push(convertedCall);
            }
          } else if (Array.isArray(node)) {
            newInbound.push(node);
          }
        }
        layer.inbound_nodes = newInbound;
        layer.inboundNodes = newInbound;
      }
    }

    // Flatten any Functional/Model sub-layers to prevent graph disconnection in TF.js
    const newLayers: any[] = [];
    for (const layer of obj.layers) {
      if ((layer.class_name === "Functional" || layer.class_name === "Model") && layer.config) {
        const subConfig = layer.config;
        const subLayers = subConfig.layers || [];
        const subInbound = layer.inbound_nodes || layer.inboundNodes;
        const firstInputName = (subInbound && subInbound.length > 0 && subInbound[0].length > 0)
          ? subInbound[0][0][0]
          : "input_image";

        const subInputName = subLayers[0]?.name || "input_layer";
        const subOutputName = subLayers[subLayers.length - 1]?.name || "block5_pool";

        for (const subLayer of subLayers) {
          if (subLayer.class_name === "InputLayer") continue;

          const layerCopy = JSON.parse(JSON.stringify(subLayer));
          const inb = layerCopy.inbound_nodes || layerCopy.inboundNodes;
          if (Array.isArray(inb)) {
            for (const nodeCall of inb) {
              if (Array.isArray(nodeCall)) {
                for (const item of nodeCall) {
                  if (Array.isArray(item) && item[0] === subInputName) {
                    item[0] = firstInputName;
                  }
                }
              }
            }
            layerCopy.inbound_nodes = inb;
            layerCopy.inboundNodes = inb;
          }
          newLayers.push(layerCopy);
        }

        // Remap other layers referencing sub-model name -> subOutputName
        for (const l of obj.layers) {
          const inb = l.inbound_nodes || l.inboundNodes;
          if (Array.isArray(inb)) {
            for (const nodeCall of inb) {
              if (Array.isArray(nodeCall)) {
                for (const item of nodeCall) {
                  if (Array.isArray(item) && item[0] === layer.name) {
                    item[0] = subOutputName;
                  }
                }
              }
            }
            l.inbound_nodes = inb;
            l.inboundNodes = inb;
          }
        }
      } else {
        newLayers.push(layer);
      }
    }
    obj.layers = newLayers;
  }

  return obj;
}

function patchKeras3Topology(modelTopology: any): any {
  if (!modelTopology || typeof modelTopology !== "object") return modelTopology;
  if (modelTopology.model_config && modelTopology.model_config.config) {
    modelTopology.model_config.config = fixKeras3ToKeras2(modelTopology.model_config.config);
  }
  return modelTopology;
}

async function loadPatchedLayersModel(modelUrl: string): Promise<tf.LayersModel> {
  const res = await fetch(modelUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching model JSON from ${modelUrl}`);
  const modelJson = await res.json();

  if (modelJson.modelTopology) {
    modelJson.modelTopology = patchKeras3Topology(modelJson.modelTopology);
  }

  const ioHandler: tf.io.IOHandler = {
    load: async () => {
      const baseUrl = modelUrl.substring(0, modelUrl.lastIndexOf("/") + 1);
      const weightManifest: tf.io.WeightsManifestConfig = modelJson.weightsManifest || [];

      const buffers: ArrayBuffer[] = [];
      for (const group of weightManifest) {
        for (const filename of group.paths) {
          const wRes = await fetch(baseUrl + filename);
          if (!wRes.ok) throw new Error(`Failed to fetch weight shard: ${filename}`);
          buffers.push(await wRes.arrayBuffer());
        }
      }

      const totalLength = buffers.reduce((sum, b) => sum + b.byteLength, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const b of buffers) {
        combined.set(new Uint8Array(b), offset);
        offset += b.byteLength;
      }

      const weightSpecs: tf.io.WeightsManifestEntry[] = [];
      for (const group of weightManifest) {
        weightSpecs.push(...group.weights);
      }

      return {
        modelTopology: modelJson.modelTopology,
        weightSpecs: weightSpecs,
        weightData: combined.buffer,
        format: modelJson.format,
        generatedBy: modelJson.generatedBy,
        convertedBy: modelJson.convertedBy,
      };
    },
  };

  return await tf.loadLayersModel(ioHandler);
}

export async function loadGestureSpeakModel(): Promise<LoadedModelBundle> {
  const backend = await initTensorFlowBackend();
  
  try {
    const model = await loadPatchedLayersModel("/model/model.json");
    
    // Warm up model with zero tensor to trigger WebGL compilation
    tf.tidy(() => {
      const dummy = tf.zeros([1, 224, 224, 3]);
      model.predict(dummy);
    });

    // Fetch metadata
    let classes: Record<string, string> = {};
    let metadata: ModelMetadata = {
      modelName: "gesturespeak-vgg16",
      version: "1.0.0",
      architecture: "VGG16",
      inputShape: [224, 224, 3],
      numClasses: 16,
      preprocessing: "vgg16",
      framework: "tensorflow",
      runtime: "tensorflowjs",
    };

    try {
      const resClasses = await fetch("/model/classes.json");
      if (resClasses.ok) classes = await resClasses.json();
    } catch {}

    try {
      const resMeta = await fetch("/model/metadata.json");
      if (resMeta.ok) metadata = await resMeta.json();
    } catch {}

    return { model, classes, metadata, backend };
  } catch (err) {
    console.error("Failed to load TensorFlow.js model from /model/model.json:", err);
    throw err;
  }
}

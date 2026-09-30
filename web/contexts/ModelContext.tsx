"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { LoadedModelBundle, loadGestureSpeakModel } from "@/services/gesture-model/loader";
import { ModelMetadata, ModelStatus } from "@/services/gesture-model/types";

interface ModelContextValue {
  status: ModelStatus;
  model: tf.LayersModel | null;
  classes: Record<string, string>;
  metadata: ModelMetadata | null;
  backend: string;
  error: string | null;
  reloadModel: () => Promise<void>;
}

const ModelContext = createContext<ModelContextValue | null>(null);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ModelStatus>("idle");
  const [bundle, setBundle] = useState<LoadedModelBundle | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initModel = async () => {
    setStatus("loading");
    setError(null);
    try {
      const loadedBundle = await loadGestureSpeakModel();
      setBundle(loadedBundle);
      setStatus("ready");
    } catch (err: any) {
      console.warn("TF.js Model initialization note:", err?.message || err);
      setError(err?.message || "Model failed to load");
      setStatus("error");
    }
  };

  useEffect(() => {
    initModel();
  }, []);

  return (
    <ModelContext.Provider
      value={{
        status,
        model: bundle?.model ?? null,
        classes: bundle?.classes ?? {},
        metadata: bundle?.metadata ?? null,
        backend: bundle?.backend ?? "cpu",
        error,
        reloadModel: initModel,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const ctx = useContext(ModelContext);
  if (!ctx) {
    throw new Error("useModel must be used within ModelProvider");
  }
  return ctx;
}

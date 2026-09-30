# GestureSpeak 🖐️💬

GestureSpeak is a real-time, browser-based hand gesture recognition and speech translation application powered by TensorFlow.js and Next.js, with a VGG16 transfer learning backbone trained in Python.

## Structure

- `python/`: Dataset preprocessing, TF2 / Keras model training, evaluation, and TensorFlow.js export.
- `web/`: Next.js 15 app with camera integration, WebGL/WebGPU TensorFlow.js inference engine, prediction smoother, and audio playback.
- `data/`: Raw hand gesture dataset (Subject 1 through 5).
- `docs/`: Technical requirements, architecture, and project rules.

## Quick Start

### Python ML Pipeline
```bash
cd python
uv sync
uv run python scripts/01_prepare_dataset.py
uv run python scripts/02_train_model.py
uv run python scripts/03_evaluate_model.py
uv run python scripts/04_export_tensorflowjs.py
```

### Web Application
```bash
cd web
pnpm install
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

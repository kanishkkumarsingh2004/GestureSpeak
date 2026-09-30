# GestureSpeak — System Architecture

## 1. Architecture Overview

GestureSpeak is divided into two completely independent environments:

1. **Python ML Environment**

   * Dataset management
   * Training
   * Testing
   * Evaluation
   * Model generation
   * TensorFlow.js model export

2. **Next.js Web Environment**

   * Camera access
   * Live video processing
   * TensorFlow.js inference
   * Gesture prediction
   * UI
   * Audio playback using Howler.js

The Python environment is **not executed by the Next.js application**.

The Next.js application does not call Python during normal inference.

The communication boundary is the exported model.

```text
┌──────────────────────────────────────────────────────────────┐
│                    PYTHON ML ENVIRONMENT                     │
│                                                              │
│  Dataset                                                    │
│     │                                                        │
│     ▼                                                        │
│  Preprocessing                                              │
│     │                                                        │
│     ▼                                                        │
│  VGG16 Training                                             │
│     │                                                        │
│     ▼                                                        │
│  Testing / Evaluation                                       │
│     │                                                        │
│     ▼                                                        │
│  Trained TensorFlow Model                                   │
│     │                                                        │
│     ▼                                                        │
│  TensorFlow.js Conversion                                   │
│     │                                                        │
│     ▼                                                        │
│  Exported Model                                             │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ Model artifacts only
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                     NEXT.JS WEB APP                          │
│                                                              │
│  Browser Camera                                             │
│       │                                                      │
│       ▼                                                      │
│  Video Stream                                                │
│       │                                                      │
│       ▼                                                      │
│  Frame Preprocessing                                        │
│       │                                                      │
│       ▼                                                      │
│  TensorFlow.js                                               │
│       │                                                      │
│       ▼                                                      │
│  VGG16-Based Model                                           │
│       │                                                      │
│       ▼                                                      │
│  Prediction                                                  │
│       │                                                      │
│       ▼                                                      │
│  Confidence Filtering                                       │
│       │                                                      │
│       ▼                                                      │
│  Prediction Smoothing                                       │
│       │                                                      │
│       ├──────────────► UI                                    │
│       │                                                      │
│       └──────────────► Howler.js                             │
└──────────────────────────────────────────────────────────────┘
```

---

# 2. Core Architectural Principle

The project must maintain a strict separation between:

```text
ML Development
```

and

```text
Web Application
```

The Python environment owns:

* Dataset
* Training
* Testing
* Model architecture
* Model evaluation
* Model conversion
* Model metadata

The Next.js environment owns:

* Camera
* Browser processing
* TensorFlow.js
* Prediction runtime
* UI
* Audio
* User interaction

The browser must never depend on:

```text
Python
uv
TensorFlow Python
Python scripts
Python HTTP server
```

during normal inference.

---

# 3. Monorepo Structure

The project should use a single repository while keeping Python and Node.js independently executable.

```text
gesturespeak/
│
├── python/
│   │
│   ├── dataset/
│   │   ├── raw/
│   │   ├── processed/
│   │   └── splits/
│   │
│   ├── train/
│   │   ├── __init__.py
│   │   ├── train.py
│   │   ├── config.py
│   │   ├── dataset.py
│   │   ├── preprocessing.py
│   │   ├── augmentations.py
│   │   ├── model.py
│   │   └── callbacks.py
│   │
│   ├── test/
│   │   ├── __init__.py
│   │   ├── test_model.py
│   │   ├── evaluate.py
│   │   ├── metrics.py
│   │   └── confusion_matrix.py
│   │
│   ├── model/
│   │   ├── checkpoints/
│   │   ├── trained/
│   │   ├── tensorflowjs/
│   │   └── metadata/
│   │
│   ├── scripts/
│   │   ├── prepare_dataset.py
│   │   ├── train_model.py
│   │   ├── test_model.py
│   │   ├── evaluate_model.py
│   │   └── export_tensorflowjs.py
│   │
│   ├── pyproject.toml
│   ├── uv.lock
│   └── README.md
│
├── web/
│   │
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── config/
│   │
│   ├── public/
│   │   ├── model/
│   │   ├── audio/
│   │   └── gestures/
│   │
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── README.md
│
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── rules.md
│   ├── model-spec.md
│   ├── dataset-spec.md
│   └── inference-spec.md
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

# 4. Python Environment

The Python environment must be completely independent from the Node.js environment.

The Python project uses:

```text
uv
```

for:

* Python environment management
* Dependency installation
* Locking
* Script execution

Do not use:

```text
pip
poetry
conda
```

as the primary project dependency manager.

---

# 5. Python Project

The Python project is responsible for the complete ML lifecycle.

```text
python/
│
├── dataset/
├── train/
├── test/
├── model/
├── scripts/
├── pyproject.toml
└── uv.lock
```

---

# 6. Python Dataset Pipeline

The dataset pipeline is:

```text
Raw Dataset
    │
    ▼
Validation
    │
    ▼
Cleaning
    │
    ▼
Preprocessing
    │
    ▼
Augmentation
    │
    ▼
Train / Validation / Test Split
```

Recommended split:

```text
Training      70%
Validation    15%
Testing       15%
```

The split should be performed carefully to avoid the same underlying capture appearing in both training and testing.

---

# 7. VGG16 Model Architecture

The initial image-classification model uses **VGG16** as its backbone.

Conceptually:

```text
Input Image
     │
     ▼
Resize
224 × 224 × 3
     │
     ▼
VGG16 Backbone
     │
     ├── Block 1
     ├── Block 2
     ├── Block 3
     ├── Block 4
     └── Block 5
     │
     ▼
Feature Representation
     │
     ▼
Global Average Pooling
     │
     ▼
Dense Layer
     │
     ▼
Dropout
     │
     ▼
Classification Layer
     │
     ▼
Gesture Probabilities
```

The model should preferably use:

```text
VGG16
include_top=False
```

rather than the original ImageNet classification head.

The application-specific classification head will be added separately.

---

# 8. Input Specification

The initial VGG16 input should be:

```text
224 × 224 × 3
```

with:

```text
RGB
```

The preprocessing pipeline must remain identical between Python training and browser inference.

Conceptually:

```text
Camera Frame
     ↓
Crop / Resize
     ↓
RGB
     ↓
224 × 224
     ↓
VGG16 preprocessing
     ↓
TensorFlow.js
```

A mismatch between Python preprocessing and browser preprocessing can invalidate the model.

---

# 9. Transfer Learning

The recommended initial training strategy is transfer learning.

```text
ImageNet
   ↓
Pretrained VGG16
   ↓
Freeze Backbone
   ↓
Train Gesture Classification Head
   ↓
Evaluate
   ↓
Optional Fine-Tuning
```

Initially:

```text
VGG16 backbone = frozen
```

After the classification head becomes stable, selected VGG16 layers may be unfrozen for fine-tuning.

Fine-tuning must be controlled carefully because VGG16 is large and can overfit a small gesture dataset.

---

# 10. Classification Head

The classification head should be separate from VGG16.

Example:

```text
VGG16
  ↓
GlobalAveragePooling2D
  ↓
Dense
  ↓
Dropout
  ↓
Dense(num_classes)
  ↓
Softmax
```

Example:

```python
x = vgg16.output

x = GlobalAveragePooling2D()(x)

x = Dense(256, activation="relu")(x)

x = Dropout(0.5)(x)

outputs = Dense(
    NUM_CLASSES,
    activation="softmax"
)(x)
```

The exact dimensions must remain configurable.

---

# 11. Model Output

The final layer produces:

```text
P(gesture | image)
```

Example:

```text
HELLO       0.91
YES         0.03
NO          0.02
STOP        0.01
THANK_YOU   0.02
NONE        0.01
```

The browser receives the probability vector.

---

# 12. Model Directory

The `python/model/` directory is the authoritative ML artifact location.

```text
python/model/
│
├── checkpoints/
│
├── trained/
│   ├── gesturespeak.keras
│   └── weights/
│
├── tensorflowjs/
│   ├── model.json
│   ├── group1-shard1ofN.bin
│   ├── group1-shard2ofN.bin
│   └── ...
│
└── metadata/
    ├── classes.json
    ├── model.json
    └── preprocessing.json
```

The Python environment produces the model.

The Next.js environment consumes the exported TensorFlow.js model.

---

# 13. Model Transfer Boundary

The most important boundary in the entire architecture is:

```text
python/model/tensorflowjs/
             │
             │
             ▼
web/public/model/
```

Only browser-compatible model artifacts should cross this boundary.

Example:

```text
python/model/tensorflowjs/model.json
          ↓
web/public/model/model.json
```

and:

```text
*.bin
```

model weight shards.

The browser should NOT receive:

```text
*.py
*.keras
*.h5
Python checkpoints
training dataset
```

unless there is a separate development requirement.

---

# 14. Model Synchronization

The model synchronization process should be explicit.

```text
Train
  ↓
Test
  ↓
Evaluate
  ↓
Export TensorFlow.js
  ↓
Validate exported model
  ↓
Copy/Sync model artifacts
  ↓
Next.js public/model/
```

Recommended synchronization command:

```text
uv run python scripts/export_tensorflowjs.py
```

The export script can optionally synchronize the final TensorFlow.js artifacts into:

```text
../web/public/model/
```

The synchronization must never modify the Python source model itself.

---

# 15. Model Metadata

The model must have metadata.

Example:

```json
{
  "modelName": "gesturespeak-vgg16",
  "version": "1.0.0",
  "architecture": "VGG16",
  "inputShape": [224, 224, 3],
  "numClasses": 10,
  "preprocessing": "vgg16",
  "framework": "tensorflow",
  "runtime": "tensorflowjs"
}
```

---

# 16. Class Metadata

The browser needs a stable mapping between model output indexes and gesture names.

Example:

```json
{
  "0": "hello",
  "1": "yes",
  "2": "no",
  "3": "thank_you",
  "4": "please",
  "5": "stop",
  "6": "help",
  "7": "good",
  "8": "bad",
  "9": "none"
}
```

The ordering must never be manually duplicated in multiple parts of the application.

---

# 17. Next.js Environment

The web application is a completely independent Node.js project.

It uses:

```text
pnpm
```

for:

* Package management
* Dependency installation
* Scripts
* Workspace management

Do not use:

```text
npm
yarn
```

as the project package manager.

---

# 18. Next.js Runtime

The web application is responsible for:

```text
Camera
Video
Frame Processing
TensorFlow.js
Inference
Prediction Smoothing
UI
Audio
```

The web application must not start Python.

---

# 19. Browser Recognition Pipeline

```text
              Camera
                │
                ▼
       MediaDevices API
                │
                ▼
          Video Element
                │
                ▼
        Frame Sampling
                │
                ▼
        Image Preprocessing
                │
                ▼
      TensorFlow.js Tensor
                │
                ▼
        VGG16-Based Model
                │
                ▼
       Probability Vector
                │
                ▼
      Confidence Filtering
                │
                ▼
       Temporal Smoothing
                │
                ▼
        Stable Gesture
             ┌──┴──┐
             ▼     ▼
            UI   Audio
                  │
                  ▼
              Howler.js
```

---

# 20. Camera Layer

The camera layer should use:

```text
navigator.mediaDevices.getUserMedia()
```

Recommended initial constraints:

```typescript
{
  video: {
    facingMode: "user",
    width: {
      ideal: 1280
    },
    height: {
      ideal: 720
    }
  },
  audio: false
}
```

The actual camera resolution should be configurable.

The model does not need to process the full 1280×720 frame.

---

# 21. Frame Processing

The camera produces a video stream.

The inference pipeline should sample frames rather than blindly processing every camera frame.

Example:

```text
Camera:
30 FPS

Inference:
10–15 FPS
```

The UI can continue rendering at the browser's normal refresh rate while inference runs at a lower frequency.

---

# 22. Image Preprocessing

The preprocessing implementation in Next.js must reproduce the Python training preprocessing.

Pipeline:

```text
Video Frame
    ↓
Crop / ROI
    ↓
Resize 224×224
    ↓
RGB
    ↓
VGG16 preprocessing
    ↓
Tensor
```

Do not introduce an untested preprocessing transformation in the browser.

---

# 23. TensorFlow.js Model Loader

The web application should contain a dedicated model service.

Example:

```text
web/
└── services/
    └── gesture-model/
        ├── loader.ts
        ├── predictor.ts
        ├── preprocessing.ts
        └── types.ts
```

Responsibilities:

### loader.ts

Loads the TensorFlow.js model.

### preprocessing.ts

Converts camera frames into model input.

### predictor.ts

Runs inference.

### types.ts

Defines prediction types.

---

# 24. Model Loading

The browser loads:

```text
/public/model/model.json
```

The TensorFlow.js runtime then loads the associated weight shards.

Conceptually:

```text
model.json
   │
   ├── weight shard
   ├── weight shard
   ├── weight shard
   └── ...
```

The model should be loaded once and cached in memory.

---

# 25. Model Lifecycle

```text
Application Start
       ↓
Initialize TensorFlow.js
       ↓
Select Backend
       ↓
Load Model
       ↓
Validate Model
       ↓
Ready
       ↓
Camera Start
       ↓
Inference
```

The UI should show:

```text
Loading Model...
```

before recognition becomes available.

---

# 26. TensorFlow.js Backend

The browser should use feature detection.

Preferred order:

```text
WebGPU
  ↓
WebGL
  ↓
CPU
```

The application must not assume that WebGPU exists.

Backend selection should be isolated inside:

```text
services/tensorflow/
```

---

# 27. Prediction Service

Prediction should be represented as:

```typescript
interface GesturePrediction {
  classId: number;
  gesture: string;
  confidence: number;
  timestamp: number;
}
```

The prediction service should not directly modify UI state.

It should return structured prediction data.

---

# 28. Confidence Filtering

The raw model prediction must pass through a confidence filter.

```text
Raw Prediction
      ↓
Confidence Check
      │
      ├── below threshold → UNKNOWN
      │
      └── above threshold → Candidate
```

Example:

```text
threshold = 0.80
```

This value should be configurable.

---

# 29. Temporal Smoothing

The browser should maintain a short prediction buffer.

Example:

```text
Prediction history:

HELLO
HELLO
HELLO
YES
HELLO
```

The smoothing layer determines the stable output.

```text
Raw predictions
       ↓
Prediction buffer
       ↓
Weighted / majority decision
       ↓
Stable gesture
```

This prevents visual prediction flickering.

---

# 30. Duplicate Prediction Suppression

A stable gesture should not repeatedly trigger audio.

Example:

```text
HELLO
HELLO
HELLO
HELLO
HELLO
```

should produce:

```text
HELLO → audio
```

rather than:

```text
HELLO → audio
HELLO → audio
HELLO → audio
HELLO → audio
HELLO → audio
```

A cooldown mechanism should be used.

---

# 31. Audio Architecture

Howler.js should be isolated from the ML layer.

```text
ML
 ↓
Stable Prediction
 ↓
Gesture Mapping
 ↓
Audio Service
 ↓
Howler.js
```

Suggested structure:

```text
web/
└── services/
    └── audio/
        ├── audio-manager.ts
        ├── gesture-audio.ts
        └── types.ts
```

The ML model must never directly instantiate Howler objects.

---

# 32. UI Architecture

Suggested structure:

```text
web/
├── app/
│   ├── page.tsx
│   ├── recognize/
│   │   └── page.tsx
│   ├── gestures/
│   │   └── page.tsx
│   ├── model/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
│
└── components/
    ├── camera/
    ├── recognition/
    ├── prediction/
    ├── audio/
    ├── model/
    └── ui/
```

---

# 33. Recognition Component Architecture

```text
RecognitionPage
      │
      ├── CameraView
      │
      ├── RecognitionOverlay
      │
      ├── PredictionDisplay
      │
      ├── ConfidenceDisplay
      │
      ├── RecognitionStatus
      │
      ├── AudioControls
      │
      └── DebugPanel
```

---

# 34. State Architecture

The application should separate state into logical categories.

### Camera State

```typescript
{
  status,
  stream,
  width,
  height
}
```

### Model State

```typescript
{
  status,
  version,
  backend,
  loaded
}
```

### Recognition State

```typescript
{
  gesture,
  confidence,
  stable,
  timestamp
}
```

### Audio State

```typescript
{
  enabled,
  volume,
  playing
}
```

Do not put all of these into one giant global state object.

---

# 35. Performance Architecture

VGG16 is computationally expensive compared with lightweight mobile vision networks.

Therefore:

```text
Camera FPS
     ≠
Inference FPS
```

The application should decouple them.

Example:

```text
Camera rendering:
30 FPS

Inference:
10 FPS
```

The exact values should be benchmark-driven.

---

# 36. Memory Management

TensorFlow.js tensors must be disposed.

Incorrect:

```text
Frame
 ↓
Create tensor
 ↓
Predict
 ↓
Create another tensor
 ↓
Predict
 ↓
Repeat indefinitely
```

This can cause browser memory growth.

Correct architecture:

```text
Frame
 ↓
Tensor
 ↓
Inference
 ↓
Extract result
 ↓
Dispose tensors
```

Use TensorFlow.js memory-management utilities where appropriate.

---

# 37. Python → Web Model Lifecycle

The complete lifecycle is:

```text
                 DATASET
                    │
                    ▼
             PYTHON TRAINING
                    │
                    ▼
                 VGG16
                    │
                    ▼
               VALIDATION
                    │
                    ▼
                  TEST
                    │
                    ▼
              FINAL MODEL
                    │
                    ▼
         TENSORFLOW.JS EXPORT
                    │
                    ▼
           python/model/
                    │
                    ▼
           Model Synchronization
                    │
                    ▼
          web/public/model/
                    │
                    ▼
            TensorFlow.js
                    │
                    ▼
                BROWSER
```

---

# 38. Development Independence

Python can run independently:

```text
cd python
uv sync
uv run python scripts/train_model.py
```

The Next.js application can run independently:

```text
cd web
pnpm install
pnpm dev
```

The web application must not require:

```text
cd python
uv run ...
```

to start.

Similarly, Python training must not require:

```text
cd web
pnpm ...
```

---

# 39. Root Workspace

The root repository may provide convenience commands, but they must not couple the environments.

Example:

```text
gesturespeak/
├── package.json
├── pnpm-workspace.yaml
├── python/
└── web/
```

The Node workspace contains only Node projects.

Python remains managed through `uv`.

---

# 40. Recommended Root Commands

Web:

```bash
pnpm --dir web dev
```

Build:

```bash
pnpm --dir web build
```

Production:

```bash
pnpm --dir web start
```

Python:

```bash
cd python
uv sync
uv run python scripts/train_model.py
```

Testing:

```bash
cd python
uv run python scripts/test_model.py
```

Export:

```bash
cd python
uv run python scripts/export_tensorflowjs.py
```

---

# 41. Model Artifact Contract

The model export directory must contain:

```text
model/
├── model.json
├── *.bin
├── classes.json
├── metadata.json
└── preprocessing.json
```

The web application should consider the model invalid if required artifacts are missing.

---

# 42. Model Validation Before Web Deployment

Before copying the model into the Next.js application:

```text
TensorFlow Model
       ↓
Python Test
       ↓
TensorFlow.js Export
       ↓
TensorFlow.js Test
       ↓
Compare Predictions
       ↓
Approve Model
```

This prevents an incorrectly converted model from silently entering production.

---

# 43. Model Versioning

Every exported model should have a version.

Example:

```text
gesturespeak-vgg16-1.0.0
```

Metadata:

```json
{
  "name": "gesturespeak-vgg16",
  "version": "1.0.0",
  "architecture": "VGG16",
  "input": [224, 224, 3]
}
```

The web application should display the loaded model version in development/debug mode.

---

# 44. Error Boundaries

The application must distinguish:

```text
Camera Error
Model Error
TensorFlow Error
Inference Error
Audio Error
UI Error
```

Do not expose internal implementation details to normal users.

---

# 45. Security Boundary

The browser receives only public model artifacts.

Never expose:

```text
Training dataset
Private datasets
Python credentials
Training logs containing sensitive information
Development secrets
```

The TensorFlow.js model itself should be considered public once shipped to the browser.

Do not place secrets inside the frontend.

---

# 46. Privacy Architecture

Default:

```text
Camera
  ↓
Browser memory
  ↓
TensorFlow.js
  ↓
Prediction
  ↓
UI
```

There should be no default:

```text
Camera
 ↓
Server
```

or:

```text
Camera
 ↓
Database
```

Raw camera frames should not be persisted.

---

# 47. Future Backend

A backend is not required for the initial recognition pipeline.

If a backend is added later, its responsibilities should remain separate from browser inference.

Potential future responsibilities:

```text
Dataset Management
Model Registry
Model Version Management
User Preferences
Analytics
Training Jobs
```

The backend should not become a mandatory inference dependency unless there is a specific reason to move inference server-side.

---

# 48. Future Dynamic Gesture Architecture

Static gestures:

```text
Frame
 ↓
VGG16
 ↓
Gesture
```

Dynamic gestures:

```text
Frame 1
Frame 2
Frame 3
...
Frame N
 ↓
VGG16 Feature Extraction
 ↓
Feature Sequence
 ↓
Temporal Model
 ↓
Dynamic Gesture
```

This should be treated as a future architecture extension.

Do not add an LSTM/Transformer simply because the project is called an AI system.

---

# 49. Critical VGG16 Constraint

The standard VGG16 architecture is large.

Therefore, the implementation should distinguish between:

```text
Training Architecture
```

and:

```text
Browser Deployment Architecture
```

The project requirement may specify VGG16, but the exported browser model should be optimized as much as the TensorFlow.js conversion process allows.

Potential optimization techniques include:

* Freezing the backbone
* Removing unnecessary training-only components
* Reducing the classification head
* TensorFlow.js graph optimization
* Weight optimization where compatible
* Lower inference frequency
* Smaller camera processing resolution
* Browser backend optimization

Quantization should only be introduced after validating prediction consistency.

---

# 50. Architecture Decision

The initial architecture is therefore:

```text
                 ┌──────────────────────────┐
                 │      Python / uv         │
                 │                          │
                 │ Dataset                  │
                 │ Train                    │
                 │ Test                     │
                 │ Evaluate                 │
                 │ VGG16                    │
                 │ Export                   │
                 └────────────┬─────────────┘
                              │
                              │
                         Model Artifacts
                              │
                              ▼
                 ┌──────────────────────────┐
                 │       Next.js / pnpm     │
                 │                          │
                 │ Camera                   │
                 │ Preprocessing            │
                 │ TensorFlow.js            │
                 │ VGG16 Model              │
                 │ Prediction               │
                 │ Smoothing                │
                 │ UI                       │
                 │ Howler.js                │
                 └──────────────────────────┘
```

The two environments remain independently runnable.

The **only required dependency from Python to Next.js is the exported TensorFlow.js model artifact and its metadata**.

---

# 51. Final Architecture Principle

The project follows this rule:

```text
TRAIN IN PYTHON
       ↓
TEST IN PYTHON
       ↓
EXPORT MODEL
       ↓
STORE IN python/model/
       ↓
SYNC EXPORTED MODEL
       ↓
LOAD IN NEXT.JS
       ↓
RUN LOCALLY IN BROWSER
```

The production recognition path is:

```text
Camera
  ↓
Next.js
  ↓
TensorFlow.js
  ↓
VGG16
  ↓
Gesture Prediction
  ↓
Confidence
  ↓
Temporal Stability
  ↓
Word
  ├──► Screen
  └──► Howler.js
```

There is no Python process in the production inference path.

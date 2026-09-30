# Product Requirements Document (PRD)

## Project Name

**GestureSpeak**

### Product Type

Real-Time Computer Vision + Hand Gesture Recognition + Web Audio Application

### Primary Technologies

* **Frontend:** Next.js / React
* **Package Manager:** pnpm
* **Styling:** Tailwind CSS
* **ML Training:** Python + TensorFlow
* **Browser ML Inference:** TensorFlow.js
* **Camera:** WebRTC / MediaDevices API
* **Audio:** Howler.js
* **Model Format:** TensorFlow SavedModel / Keras → TensorFlow.js
* **Backend:** Optional initially
* **Deployment:** Static/Web-compatible deployment for inference
* **Language:** TypeScript for frontend, Python for training pipeline

---

# 1. Product Overview

GestureSpeak is a browser-based real-time hand gesture recognition system that uses a device camera to observe a user's hand movements and gestures.

The camera continuously captures video frames. A computer-vision pipeline processes these frames and extracts relevant hand information. A trained TensorFlow model then classifies the gesture and produces a corresponding word or phrase.

The detected result is displayed on the website and can optionally be converted into audio using Howler.js.

The primary objective is to create a low-latency pipeline:

```text
Camera
   ↓
Video Stream
   ↓
Frame Extraction
   ↓
Image Preprocessing
   ↓
Hand / Gesture Detection
   ↓
Feature Extraction
   ↓
TensorFlow.js Model
   ↓
Gesture Classification
   ↓
Confidence Filtering
   ↓
Word / Phrase
   ↓
UI + Audio
```

---

# 2. Problem Statement

Hand gestures are an important communication mechanism, particularly in environments where spoken communication is difficult or unavailable.

However, conventional gesture-recognition systems often require dedicated applications, specialized hardware, or complex computer-vision infrastructure.

GestureSpeak aims to provide a browser-first solution where users can:

1. Open a website.
2. Give camera permission.
3. Show a supported gesture.
4. Have the gesture recognized in real time.
5. See the corresponding word or phrase.
6. Optionally hear the recognized output.

The system should work without requiring a separate desktop application.

---

# 3. Product Goals

## Primary Goals

### G1 — Real-Time Recognition

Recognize supported hand gestures directly from the live camera feed.

### G2 — Browser-Based Inference

Run the trained model directly inside the browser using TensorFlow.js.

### G3 — Low Latency

The recognition pipeline should minimize delay between:

```text
Gesture → Prediction → UI Output
```

### G4 — Visual Feedback

Users should be able to see:

* Camera preview
* Hand detection state
* Current gesture
* Confidence
* Recognition status
* Prediction history

### G5 — Audio Output

Recognized words should optionally be played through the browser using Howler.js.

### G6 — Expandable Dataset

The system should support adding new gesture classes without redesigning the entire application.

### G7 — Offline-Capable Inference

After the model and required assets have loaded, core inference should not require a server request.

---

# 4. Non-Goals

The first version should NOT attempt to:

* Translate arbitrary sign language completely.
* Understand unrestricted human language.
* Generate arbitrary sentences using an LLM.
* Recognize every possible hand gesture.
* Perform medical interpretation of gestures.
* Identify users.
* Store camera footage by default.
* Upload raw camera footage to a server.
* Replace professional sign-language interpretation.

The first version should focus on **controlled gesture classification**.

---

# 5. Target Users

## Primary Users

* Students
* Developers experimenting with computer vision
* AI/ML learners
* Accessibility-focused application developers
* Researchers experimenting with gesture recognition

## Secondary Users

* Educational institutions
* Human-computer interaction researchers
* Robotics developers
* Assistive-technology developers

---

# 6. Core User Flow

```text
User opens GestureSpeak
        ↓
Application loads
        ↓
TensorFlow.js model loads
        ↓
User clicks "Start Camera"
        ↓
Browser requests camera permission
        ↓
Camera stream starts
        ↓
Video frames enter recognition pipeline
        ↓
Hand is detected
        ↓
Features are extracted
        ↓
Model predicts gesture
        ↓
Confidence is calculated
        ↓
Prediction smoothing is applied
        ↓
Gesture is accepted
        ↓
Corresponding word is displayed
        ↓
Optional audio is played
```

---

# 7. Functional Requirements

## FR-001 — Camera Access

The application shall request access to the user's camera using the browser MediaDevices API.

The application shall:

* Request permission explicitly.
* Display camera status.
* Handle denied permissions.
* Handle unavailable cameras.
* Handle camera disconnection.
* Allow the user to stop the camera.

Example states:

```text
Camera:
[ Permission Required ]

Camera:
[ Active ]

Camera:
[ Permission Denied ]

Camera:
[ Unavailable ]
```

---

# 8. Live Video Processing

The application shall process the live camera stream without requiring the user to upload individual images.

The video pipeline should support:

```text
Camera FPS
      ↓
Frame Sampling
      ↓
Resize
      ↓
Normalization
      ↓
Model Input
```

The system should avoid unnecessarily processing every available camera frame if doing so reduces browser performance.

Example:

```text
Camera:
30 FPS

Inference:
10–20 FPS
```

The exact inference rate should be configurable.

---

# 9. Gesture Recognition

The system shall classify predefined gestures.

Example initial classes:

```text
HELLO
YES
NO
THANK_YOU
PLEASE
STOP
HELP
GOOD
BAD
LOVE
NONE
```

The exact classes should be configurable through the dataset/model configuration.

Each prediction should contain:

```typescript
{
  gesture: string;
  confidence: number;
  timestamp: number;
}
```

---

# 10. Model Architecture

The first implementation should use a supervised classification model rather than an LLM.

Recommended conceptual pipeline:

```text
Camera Frame
     ↓
Hand Detection
     ↓
Hand Region / Keypoints
     ↓
Feature Normalization
     ↓
Gesture Model
     ↓
Class Probabilities
```

The model can initially operate on:

### Option A — Image Classification

```text
Image
 ↓
CNN / Lightweight Vision Model
 ↓
Gesture Class
```

### Option B — Landmark Classification

```text
Hand
 ↓
21 Hand Landmarks
 ↓
Normalized Coordinates
 ↓
Dense / MLP Classifier
 ↓
Gesture
```

### Option C — Temporal Gesture Model

For gestures involving movement:

```text
Frame 1
Frame 2
Frame 3
...
Frame N
 ↓
Temporal Model
 ↓
Gesture
```

For the first release, **landmark-based classification is preferable if the gestures can be represented sufficiently by hand pose**, because it dramatically reduces the input size and browser inference cost.

Dynamic gestures should later be handled using temporal sequences.

---

# 11. Python Training Pipeline

Training shall initially be performed in Python using TensorFlow.

Recommended pipeline:

```text
Dataset
   ↓
Dataset Validation
   ↓
Data Cleaning
   ↓
Frame / Landmark Extraction
   ↓
Normalization
   ↓
Train / Validation / Test Split
   ↓
Augmentation
   ↓
Model Training
   ↓
Evaluation
   ↓
Model Export
   ↓
TensorFlow.js Conversion
```

---

# 12. Dataset Structure

Recommended structure:

```text
dataset/
├── hello/
├── yes/
├── no/
├── thank_you/
├── please/
├── stop/
├── help/
└── none/
```

If using landmark-based training:

```text
dataset/
├── hello/
│   ├── sample_001.json
│   ├── sample_002.json
│   └── ...
├── yes/
├── no/
└── ...
```

Each landmark sample may contain:

```json
{
  "landmarks": [
    [x, y, z],
    [x, y, z]
  ],
  "label": "hello"
}
```

---

# 13. Dataset Requirements

The dataset should include variation in:

* Hand size
* Skin tone
* Lighting
* Camera quality
* Background
* Hand orientation
* Distance from camera
* Left/right hand
* Gesture execution
* Camera angle

A model trained on a single person's hand in a controlled environment may perform well during development but fail badly in real-world use.

Therefore, dataset diversity is a core requirement.

---

# 14. Data Augmentation

Training may use:

* Rotation
* Translation
* Scaling
* Horizontal flipping where semantically valid
* Brightness variation
* Contrast variation
* Noise
* Minor perspective changes

Augmentation must not alter the meaning of a gesture.

For example, left/right flipping should NOT automatically be enabled for gestures where handedness matters.

---

# 15. Model Output

The model should output a probability distribution.

Example:

```text
HELLO       0.82
YES         0.04
NO          0.02
THANK_YOU   0.06
STOP        0.03
NONE        0.03
```

The highest probability is not automatically accepted.

---

# 16. Confidence Threshold

The system shall implement a configurable confidence threshold.

Example:

```text
threshold = 0.80
```

If:

```text
confidence >= threshold
```

the prediction can become a candidate result.

Otherwise:

```text
UNKNOWN
```

or:

```text
NO CONFIDENT GESTURE
```

should be displayed.

This prevents the system from converting uncertain predictions into incorrect words.

---

# 17. Prediction Smoothing

Frame-by-frame prediction can be unstable.

Example:

```text
HELLO
HELLO
YES
HELLO
YES
HELLO
```

The UI should not immediately display every prediction.

Instead, use temporal smoothing:

```text
Frame predictions
       ↓
Prediction buffer
       ↓
Majority / weighted voting
       ↓
Stable prediction
```

Example:

```text
Buffer:

HELLO
HELLO
HELLO
HELLO
YES

Final:
HELLO
```

---

# 18. Prediction Stability

The system should support:

```typescript
stabilityWindow
confidenceThreshold
minimumStableFrames
cooldownPeriod
```

Example:

```text
confidenceThreshold = 0.80
minimumStableFrames = 5
cooldownPeriod = 800ms
```

These values should be configurable.

---

# 19. Gesture → Word Mapping

The model should produce a class identifier.

A separate mapping layer should convert the identifier into user-facing content.

Example:

```json
{
  "hello": {
    "text": "Hello",
    "audio": "/audio/hello.mp3"
  },
  "thank_you": {
    "text": "Thank you",
    "audio": "/audio/thank-you.mp3"
  }
}
```

This prevents UI text and audio logic from being hard-coded inside the model.

---

# 20. Audio System

Howler.js shall be used for browser audio playback.

Pipeline:

```text
Gesture
   ↓
Stable Prediction
   ↓
Gesture Metadata
   ↓
Audio Asset
   ↓
Howler.js
   ↓
Speaker
```

The application should provide:

* Enable/disable audio
* Volume control
* Replay
* Automatic playback
* Audio loading state

Audio should not repeatedly play every time the same gesture appears in consecutive frames.

---

# 21. Camera UI

The camera interface should contain:

```text
┌─────────────────────────────────────┐
│                                     │
│          LIVE CAMERA                │
│                                     │
│          [ Hand Area ]              │
│                                     │
│                                     │
└─────────────────────────────────────┘

Gesture:
HELLO

Confidence:
92%

Status:
● Recognizing
```

Optional visual overlays:

* Hand landmarks
* Bounding box
* Recognition region
* FPS
* Inference latency

---

# 22. Main Website Pages

## 22.1 Home

Purpose:

Introduce GestureSpeak.

Contains:

* Product description
* Start recognition button
* Demo animation
* Supported gestures
* How it works

---

## 22.2 Recognition

Primary application screen.

Contains:

* Camera feed
* Prediction
* Confidence
* Audio controls
* Recognition status
* FPS
* Inference latency
* Reset button

---

## 22.3 Gesture Library

Displays supported gestures.

Example:

```text
HELLO
YES
NO
THANK YOU
HELP
STOP
PLEASE
```

Each item can contain:

* Gesture name
* Example image
* Description
* Audio
* Recognition status

---

## 22.4 Model Information

Developer-oriented page containing:

* Model name
* Model version
* Number of classes
* Input shape
* Model size
* Framework
* Training dataset information
* Accuracy
* Validation accuracy
* TensorFlow.js backend

---

## 22.5 Settings

Settings should include:

```text
Camera
Audio
Confidence Threshold
Inference Rate
Show Landmarks
Show FPS
Show Debug Information
```

---

# 23. Visual Design

The website should use a **white + yellow** visual identity.

## Primary Colors

```text
Background:
White

Primary:
Yellow

Text:
Dark / Black

Secondary:
Light Gray

Borders:
Soft Gray
```

The yellow should be used for:

* Primary buttons
* Active states
* Recognition indicators
* Highlights
* Important UI elements

Avoid using excessive yellow across the entire interface.

The camera and prediction areas should remain visually clean.

---

# 24. UI Design Principles

The interface should be:

* Minimal
* Modern
* Accessible
* Responsive
* Mobile-friendly
* High contrast
* Easy to understand

The recognition screen should prioritize the camera and prediction rather than decorative UI.

---

# 25. Browser Compatibility

Target:

* Chrome
* Edge
* Firefox
* Safari

The application should gracefully handle browsers that do not support required camera or WebGL capabilities.

---

# 26. TensorFlow.js Runtime

The browser model should support an appropriate TensorFlow.js backend.

Potential backends:

```text
WebGL
WebGPU
CPU
```

Preferred runtime selection:

```text
WebGPU
   ↓
WebGL
   ↓
CPU
```

The actual implementation should detect browser support instead of assuming WebGPU exists.

---

# 27. Performance Requirements

Target:

```text
Camera:
24–30 FPS

Inference:
10–20 FPS

Target prediction latency:
< 150 ms where hardware permits

UI:
60 FPS target
```

These are engineering targets rather than guaranteed values.

Performance should be measured on real target devices.

---

# 28. Memory Requirements

The browser should avoid unnecessary tensor allocation.

TensorFlow.js tensors must be disposed correctly.

Conceptually:

```text
Frame
 ↓
Tensor
 ↓
Inference
 ↓
Prediction
 ↓
Tensor disposal
```

Memory leaks caused by repeatedly creating tensors can eventually crash or severely slow the browser.

---

# 29. Privacy Requirements

The camera feed should remain local by default.

The application should NOT upload camera frames unless the user explicitly enables a feature requiring upload.

Default architecture:

```text
Camera
 ↓
Browser
 ↓
Local Processing
 ↓
Local Model
 ↓
Prediction
```

No raw video storage should occur by default.

---

# 30. Security Requirements

The application must:

* Use HTTPS in production.
* Request camera permissions only when necessary.
* Never silently activate the camera.
* Never upload camera data without explicit consent.
* Avoid storing raw camera footage.
* Validate model assets.
* Restrict external resource loading where practical.

---

# 31. Model Versioning

Models should have explicit versions.

Example:

```text
gesture-model-v1
gesture-model-v2
gesture-model-v3
```

Metadata:

```json
{
  "modelVersion": "1.0.0",
  "classes": 10,
  "inputShape": [63],
  "framework": "tensorflow",
  "exportFormat": "tensorflowjs"
}
```

---

# 32. Model Evaluation

The model should not be evaluated using accuracy alone.

Required metrics:

* Accuracy
* Precision
* Recall
* F1 score
* Confusion matrix
* Per-class accuracy
* False positive rate
* False negative rate
* Inference latency

Example:

```text
Class       Precision   Recall   F1
------------------------------------
HELLO       0.94        0.91    0.92
YES         0.91        0.95    0.93
NO          0.89        0.90    0.89
```

---

# 33. Unknown / None Class

A `NONE` or `UNKNOWN` class is strongly recommended.

Without it, the classifier may be forced to classify every camera frame as one of the supported gestures.

Example:

```text
Empty hand
Background
Random movement
Face
Object
Unknown pose
```

should be capable of producing:

```text
NONE
```

rather than:

```text
HELLO
```

---

# 34. Dynamic Gesture Support

The initial version may focus on static gestures.

Future versions can support dynamic gestures using sequences:

```text
t1 → t2 → t3 → t4 → t5
```

Possible architecture:

```text
Landmarks
   ↓
Sequence Buffer
   ↓
Temporal Model
   ↓
Gesture Classification
```

Potential models:

* LSTM
* GRU
* 1D Temporal CNN
* Transformer encoder

A temporal model should only be introduced when static classification is insufficient.

---

# 35. Architecture Overview

```text
                 ┌─────────────────────┐
                 │      Browser        │
                 │                     │
Camera ─────────►│ MediaDevices API    │
                 │        │            │
                 │        ▼            │
                 │ Video Processing    │
                 │        │            │
                 │        ▼            │
                 │ Feature Extraction  │
                 │        │            │
                 │        ▼            │
                 │ TensorFlow.js        │
                 │        │            │
                 │        ▼            │
                 │ Prediction          │
                 │        │            │
                 │        ▼            │
                 │ Smoothing            │
                 │        │            │
                 │        ▼            │
                 │ Gesture Mapping     │
                 │        │            │
                 │   ┌────┴────┐       │
                 │   ▼         ▼       │
                 │  UI      Howler.js  │
                 │             │       │
                 └─────────────┼───────┘
                               ▼
                            Speaker
```

---

# 36. Training Architecture

```text
                Python Environment
                       │
                       ▼
                   Dataset
                       │
                       ▼
               Data Preprocessing
                       │
                       ▼
               Feature Extraction
                       │
                       ▼
                 TensorFlow
                       │
                       ▼
                 Model Training
                       │
                       ▼
                  Evaluation
                       │
                       ▼
                 Saved Model
                       │
                       ▼
             TensorFlow.js Converter
                       │
                       ▼
                Browser Model
```

---

# 37. Suggested Repository Structure

```text
gesturespeak/
│
├── apps/
│   └── web/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── models/
│       ├── public/
│       │   ├── audio/
│       │   └── gestures/
│       ├── styles/
│       └── package.json
│
├── ml/
│   ├── dataset/
│   ├── preprocessing/
│   ├── training/
│   ├── evaluation/
│   ├── export/
│   ├── models/
│   ├── scripts/
│   └── requirements.txt
│
├── configs/
│   ├── gestures.json
│   ├── model.json
│   └── inference.json
│
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── rules.md
│   ├── model-spec.md
│   ├── dataset-spec.md
│   └── inference-spec.md
│
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

# 38. Configuration

Gesture classes should not be hard-coded throughout the application.

Example:

```json
{
  "gestures": [
    {
      "id": "hello",
      "label": "Hello",
      "audio": "/audio/hello.mp3"
    },
    {
      "id": "thank_you",
      "label": "Thank You",
      "audio": "/audio/thank-you.mp3"
    }
  ]
}
```

---

# 39. Error Handling

The system must handle:

### Camera Errors

```text
Permission denied
No camera found
Camera disconnected
Camera already in use
```

### Model Errors

```text
Model failed to load
Invalid model
Unsupported browser
Backend initialization failure
```

### Runtime Errors

```text
Inference failure
Tensor allocation failure
Audio loading failure
Unsupported device
```

Errors should be shown using understandable messages rather than raw stack traces.

---

# 40. Accessibility

The application should support:

* Keyboard navigation
* Screen-reader-friendly labels
* High-contrast text
* Large prediction display
* Clear status indicators
* Audio controls
* Reduced-motion preference

Important recognition information should never be communicated only through color.

---

# 41. Logging

Development mode may expose:

```text
FPS
Inference time
Model load time
Prediction confidence
Current class
TensorFlow backend
Camera resolution
```

Production mode should minimize unnecessary logging.

---

# 42. Analytics

The initial version should avoid collecting camera-derived personal data.

If analytics are introduced later, collect only non-sensitive application metrics such as:

```text
Model load duration
Browser type
Inference performance
Application errors
```

Do not collect raw camera frames by default.

---

# 43. Acceptance Criteria

## Camera

* User can grant camera permission.
* Live camera feed appears.
* User can stop the camera.
* Permission failures are handled.

## Model

* TensorFlow.js model loads successfully.
* Model performs inference in-browser.
* Predictions contain confidence values.
* Unknown gestures can be rejected.

## Recognition

* Supported gestures can be recognized.
* Predictions are temporally smoothed.
* Unstable predictions are not immediately displayed.
* Confidence threshold is configurable.

## Audio

* Recognized gesture can trigger audio.
* Audio can be disabled.
* Audio does not repeatedly trigger every frame.

## UI

* White/yellow visual theme is implemented.
* Interface is responsive.
* Recognition result is clearly visible.
* Camera state is visible.

## Privacy

* Camera remains local by default.
* No raw video is uploaded automatically.
* Camera is never activated without user interaction/permission.

---

# 44. Development Phases

## Phase 1 — Project Foundation

Build:

* Next.js application
* TypeScript
* Tailwind CSS
* pnpm workspace
* Basic UI
* Camera permission flow

---

## Phase 2 — Camera Pipeline

Implement:

```text
Camera
 ↓
Video
 ↓
Frame extraction
 ↓
Canvas/ImageData
```

Measure:

* FPS
* Resolution
* Processing time

---

## Phase 3 — Dataset

Create initial gesture classes.

Collect:

* Multiple people
* Multiple lighting conditions
* Different backgrounds
* Different hand positions

Create training/validation/test splits.

---

## Phase 4 — Python Model

Implement:

```text
Dataset
 ↓
Preprocessing
 ↓
TensorFlow model
 ↓
Training
 ↓
Evaluation
```

Generate:

```text
model/
├── model files
├── labels
└── metadata
```

---

## Phase 5 — TensorFlow.js Conversion

Convert the trained TensorFlow model into browser-compatible TensorFlow.js format.

Test:

```text
Python prediction
       vs
TensorFlow.js prediction
```

The outputs should be sufficiently consistent.

---

## Phase 6 — Browser Inference

Implement:

```text
Video
 ↓
Preprocessing
 ↓
TensorFlow.js
 ↓
Prediction
```

Add:

* Confidence threshold
* Prediction smoothing
* FPS measurement
* Latency measurement

---

## Phase 7 — Audio

Integrate Howler.js.

Implement:

* Gesture → audio mapping
* Playback
* Volume
* Replay
* Enable/disable

---

## Phase 8 — UI

Implement the complete white/yellow interface.

Build:

* Home
* Recognition
* Gesture library
* Model information
* Settings

---

## Phase 9 — Testing

Test:

* Different cameras
* Different lighting
* Different users
* Mobile devices
* Desktop devices
* Different browsers
* Different hand positions

---

## Phase 10 — Optimization

Optimize:

* Model size
* Tensor allocation
* Inference frequency
* Camera resolution
* WebGL/WebGPU execution
* Memory consumption

---

# 45. Future Features

Potential future versions can add:

### V2

* More gestures
* Dynamic gesture recognition
* Sentence construction
* Gesture history
* Custom gesture training

### V3

* Multi-hand recognition
* Sign-language sequences
* Context-aware interpretation
* Personalized models
* Multiple language output

### V4

Potential architecture:

```text
Gesture Recognition
        ↓
Gesture Sequence
        ↓
Language Model
        ↓
Natural Language Sentence
        ↓
Text-to-Speech
```

At that stage an LLM could become useful for transforming recognized gesture sequences into natural language.

It should **not** be introduced merely because the application involves words.

---

# 46. Important Technical Constraint

The biggest technical risk is not TensorFlow.js itself.

It is **gesture ambiguity**.

A model may achieve high validation accuracy while failing in real-world conditions because:

```text
Training environment
        ≠
Real-world environment
```

Therefore, the project must evaluate generalization across users and environments.

A model trained only on your own hand against a controlled background should not be considered production-ready.

---

# 47. Success Metrics

The project should track:

```text
Recognition Accuracy
Per-Class F1
Unknown Detection Rate
False Positive Rate
Inference Latency
Model Load Time
Memory Usage
Browser FPS
Audio Trigger Latency
```

The final objective is not simply:

```text
"Model has 95% accuracy."
```

It is:

```text
Reliable gesture recognition
+
Low browser latency
+
Stable predictions
+
Low false positives
+
Good cross-user generalization
```

---

# 48. Final Product Definition

GestureSpeak is a browser-based real-time hand gesture recognition platform.

Its core pipeline is:

```text
             CAMERA
                │
                ▼
          VIDEO STREAM
                │
                ▼
       FRAME PREPROCESSING
                │
                ▼
       HAND / FEATURE EXTRACTION
                │
                ▼
        TENSORFLOW.JS MODEL
                │
                ▼
       CLASS PROBABILITIES
                │
                ▼
       CONFIDENCE FILTER
                │
                ▼
      TEMPORAL SMOOTHING
                │
                ▼
       GESTURE → WORD
             ┌──┴──┐
             ▼     ▼
           TEXT   AUDIO
                    │
                    ▼
                HOWLER.JS
```

The training side remains:

```text
Python
  ↓
TensorFlow
  ↓
Dataset
  ↓
Training
  ↓
Evaluation
  ↓
Model Export
  ↓
TensorFlow.js
  ↓
Browser
```

The first release should remain deliberately narrow: **recognize a controlled set of gestures reliably and locally in the browser**. Expanding into unrestricted sign-language translation or LLM-based sentence generation should come only after the underlying recognition pipeline is demonstrably reliable.

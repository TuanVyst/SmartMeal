---
name: ai-design
description: Machine learning engineering, ONNX Runtime inference service patterns, and Docker optimization for SmartMeal AI.
triggers:
  - working on AI/ or smartmeal-predict
  - modifying Python inference code, predictor.py, app.py, or config.py
  - updating ONNX models, YOLO pre/post-processing, NMS, or image resizing
  - configuring Dockerfile, uv dependencies, memory limits, or health checks
---

# AI & Inference Service Design Skill

Standards, patterns, and conventions for developing the SmartMeal AI prediction service (`AI/`).

---

## 1. Stateless Microservice Architecture

The AI subsystem (`smartmeal-predict`) serves YOLO/ONNX object detection for food ingredients:
- **Framework**: Python 3.11+ / Flask application with CORS enabled.
- **Inference Engine**: ONNX Runtime (`onnxruntime`), targeting CPU by default (`CPUExecutionProvider`).
- **Core Principle**: Completely stateless execution. Each request is evaluated independently without persisting user state, temporary files on disk, or session locks.

---

## 2. Image Preprocessing & Post-processing Pipeline

### 2.1 Preprocessing (Pillow / NumPy)
- Ingest byte stream in-memory via `io.BytesIO(image_bytes)` and convert to RGB:
  ```python
  image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
  ```
- Maintain aspect ratio or resize to standard inference resolution (default `IMG_SIZE = 640`):
  ```python
  resized = image.resize((IMG_SIZE, IMG_SIZE))
  img = np.array(resized).astype(np.float32) / 255.0
  # HWC -> CHW -> BCHW
  img = np.transpose(img, (2, 0, 1))
  img = np.expand_dims(img, axis=0)
  ```

### 2.2 Post-Processing & Non-Maximum Suppression (NMS)
- Vectorized Non-Maximum Suppression (`nms` function in `predictor.py`):
  - Filter predictions by confidence threshold (`CONF_THRESHOLD = 0.25`).
  - Calculate Intersection over Union (IoU) efficiently using NumPy matrix operations (`IOU_THRESHOLD = 0.45`).
  - Coordinate scaling: Rescale normalized/letterboxed coordinates back to original image dimensions (`original_width`, `original_height`).
- Return structured detection objects:
  ```json
  {
    "box": [x1, y1, x2, y2],
    "class_id": 12,
    "class_name": "tomato",
    "confidence": 0.88
  }
  ```

---

## 3. Endpoints, Health Checks & Observability

### 3.1 Route Endpoints
The service supports both root and prefixed endpoints (e.g. `/predict`, `/smartmeal-predict/predict`):
1. `GET /`: Basic readiness check returning service metadata.
2. `GET /health`: Liveness and health check endpoint detailing model path, runtime engine, and device execution provider.
3. `POST /predict`: Primary detection endpoint accepting `multipart/form-data` with `image` file field.

### 3.2 Error Handling & Logging
- Validate multipart file existence and non-empty byte count before invoking inference.
- Return explicit HTTP 400 for bad payloads (`Missing 'image' in multipart form data` or `Empty file received`).
- Return HTTP 500 with sanitized error messages and structured logs for inference runtime exceptions.
- Use Python's standard `logging` library (`logger.info`, `logger.error`), never bare `print()` statements.

---

## 4. Docker Optimization & Resource Management

### 4.1 Multi-Stage / Lightweight Containerization
- Build containers using minimal base images (`python:3.11-slim` or `distroless`).
- Install system dependencies (`libgomp1` for ONNX OpenMP threading) and purge apt caches.
- Use `uv` package manager (`uv sync --frozen --no-dev`) for deterministic, fast installs.

### 4.2 Memory & CPU Management
- Load ONNX `InferenceSession` once at application startup in `create_app()`; avoid reloading sessions per request.
- Restrict thread pool overhead if running in multi-worker environments:
  ```python
  opts = ort.SessionOptions()
  opts.intra_op_num_threads = 2
  opts.inter_op_num_threads = 1
  ```
- Explicitly free or avoid caching large NumPy arrays across request boundaries to keep container memory footprint stable.

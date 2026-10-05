from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5176",
                "http://127.0.0.1:5176"
            ]
        }
    }
)
# Load YOLO V6
model = YOLO("best.pt")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({
                "success": False,
                "message": "Không có ảnh"
            }), 400

        file = request.files["image"]

        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        results = model.predict(
            source=image,
            imgsz=512,
            conf=0.25,
            device=0,
            verbose=False
        )

        detections = []

        for result in results:
            boxes = result.boxes

            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                detections.append({
                    "class_id": class_id,
                    "name": model.names[class_id],
                    "confidence": round(confidence, 4),
                    "box": [round(float(x), 2) for x in box.xyxy[0].tolist()]
                })

        return jsonify({
            "success": True,
            "detections": detections
        })

    except Exception as e:
        print("Prediction error:", e)

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model": "YOLO V6"
    })


if __name__ == "__main__":
    import os

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5001)),
        debug=False
    )
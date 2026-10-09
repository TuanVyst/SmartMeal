import io
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image

from smartmeal_predict.config import MODEL_PATH, ROUTE_PREFIX
from smartmeal_predict.predictor import Predictor
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, origins="*")

    predictor = Predictor(MODEL_PATH)
    logger.info("Loaded ONNX model from: %s", MODEL_PATH)

    def register_routes(prefix: str = ""):
        clean_prefix = prefix.strip("/")
        url_prefix = f"/{clean_prefix}" if clean_prefix else ""
        suffix = f"_{clean_prefix}" if clean_prefix else ""

        @app.route(f"{url_prefix}/" if url_prefix else "/", methods=["GET"], endpoint=f"root{suffix}")
        def root():
            return jsonify({
                "service": "smartmeal-predict",
                "status": "ready",
            })

        @app.route(f"{url_prefix}/health", methods=["GET"], endpoint=f"health{suffix}")
        def health():
            return jsonify({
                "status": "ok",
                "model": MODEL_PATH,
                "runtime": "ONNX Runtime",
                "device": "CPU",
            })

        @app.route(f"{url_prefix}/predict", methods=["POST"], endpoint=f"predict{suffix}")
        def predict_endpoint():
            return handle_predict()
    def handle_predict():
        try:
            if "image" not in request.files:
                return jsonify({
                    "success": False,
                    "message": "Missing 'image' in multipart form data",
                }), 400

            file = request.files["image"]
            image_bytes = file.read()
            if not image_bytes:
                return jsonify({
                    "success": False,
                    "message": "Empty file received",
                }), 400

            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            detections = predictor.predict(image)

            return jsonify({
                "success": True,
                "detections": detections,
            })
        except Exception as e:
            logger.exception("Prediction failed: %s", e)
            return jsonify({
                "success": False,
                "message": str(e),
            }), 500
    register_routes("")
    if ROUTE_PREFIX:
        register_routes(ROUTE_PREFIX)

    return app

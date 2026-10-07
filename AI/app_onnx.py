from flask import Flask, request, jsonify
from flask_cors import CORS

import onnxruntime as ort
import numpy as np
from PIL import Image
import io


app = Flask(__name__)
CORS(app, origins="*")


# ============================================================
# CONFIG
# ============================================================

MODEL_PATH = r"C:\Users\Nitro5\Desktop\EXE201\SmartMeal-master\SmartMeal\AI\best.onnx"

IMG_SIZE = 512
CONF_THRESHOLD = 0.25
IOU_THRESHOLD = 0.45


CLASS_NAMES = [
    "Mushroom",
    "Egg",
    "Sweet Potato -Suthuni-",
    "Taro Leaves -Karkalo-",
    "Beetroot",
    "Potato",
    "Capsicum",
    "Taro Root-Pidalu-",
    "Turnip",
    "Green Mint -Pudina-",
    "Pointed Gourd -Chuche Karela-",
    "Stinging Nettle -Sisnu-",
    "Bitter Gourd",
    "Snake Gourd -Chichindo-",
    "Fiddlehead Ferns -Niguro-",
    "Palungo -Nepali Spinach-",
    "Cabbage",
    "Brinjal",
    "Bottle Gourd -Lauka-",
    "Tomato",
    "Onion",
    "Radish",
    "Sponge Gourd -Ghiraula-",
    "Red Lentils",
    "Masyaura",
    "Okra -Bhindi-",
    "Chayote-iskus-",
    "Garden Peas",
    "Cheese",
    "Rayo ko Saag",
    "Lapsi -Nepali Hog Plum-",
    "Artichoke",
    "Banana",
    "Cinnamon",
    "Bread",
    "Jack Fruit",
    "Beans",
    "Asparagus -Kurilo-",
    "Gundruk",
    "Avocado",
    "Nutrela -Soya Chunks-",
    "Rice -Chamal-",
    "Corn",
    "Onion Leaves",
    "Tree Tomato -Rukh Tamatar-",
    "Carrot",
    "Farsi ko Munta",
    "Coriander -Dhaniya-",
    "Lemon -Nimbu-",
    "Cassava -Ghar Tarul-",
    "Pork",
    "Cucumber",
    "Black Lentils",
    "Ash Gourd -Kubhindo-"
]


# ============================================================
# LOAD ONNX MODEL
# ============================================================

session = ort.InferenceSession(
    MODEL_PATH,
    providers=["CPUExecutionProvider"]
)

input_name = session.get_inputs()[0].name


print("===================================")
print("SmartMeal ONNX API")
print("Model:", MODEL_PATH)
print("Provider:", session.get_providers())
print("Input:", input_name)
print("===================================")


# ============================================================
# NMS
# ============================================================

def nms(boxes, scores, iou_threshold=0.45):

    boxes = np.array(boxes)
    scores = np.array(scores)

    if len(boxes) == 0:
        return []

    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]

    areas = np.maximum(0, x2 - x1) * np.maximum(0, y2 - y1)

    order = scores.argsort()[::-1]

    keep = []

    while len(order) > 0:

        i = order[0]
        keep.append(i)

        if len(order) == 1:
            break

        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])

        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])

        w = np.maximum(0, xx2 - xx1)
        h = np.maximum(0, yy2 - yy1)

        intersection = w * h

        union = areas[i] + areas[order[1:]] - intersection

        iou = intersection / (union + 1e-6)

        order = order[1:][iou < iou_threshold]

    return keep


# ============================================================
# PREPROCESS
# ============================================================

def preprocess(image):

    original_width, original_height = image.size

    resized = image.resize((IMG_SIZE, IMG_SIZE))

    img = np.array(resized).astype(np.float32) / 255.0

    # HWC -> CHW
    img = np.transpose(img, (2, 0, 1))

    # CHW -> BCHW
    img = np.expand_dims(img, axis=0)

    return img, original_width, original_height


# ============================================================
# PREDICT
# ============================================================

def predict(image):

    img, original_width, original_height = preprocess(image)

    outputs = session.run(
        None,
        {
            input_name: img
        }
    )

    output = outputs[0][0]

    # [58, 5376]
    boxes = output[:4, :]
    class_scores = output[4:, :]

    class_ids = np.argmax(class_scores, axis=0)
    confidences = np.max(class_scores, axis=0)

    # confidence filter
    mask = confidences >= CONF_THRESHOLD

    boxes = boxes[:, mask]
    class_ids = class_ids[mask]
    confidences = confidences[mask]

    # ==========================================
    # XYWH -> XYXY
    # ==========================================

    cx = boxes[0]
    cy = boxes[1]
    w = boxes[2]
    h = boxes[3]

    x1 = cx - w / 2
    y1 = cy - h / 2
    x2 = cx + w / 2
    y2 = cy + h / 2

    decoded_boxes = np.stack(
        [x1, y1, x2, y2],
        axis=1
    )

    # ==========================================
    # CLASS-WISE NMS
    # ==========================================

    final_indices = []

    for class_id in np.unique(class_ids):

        indices = np.where(class_ids == class_id)[0]

        class_boxes = decoded_boxes[indices]
        class_scores = confidences[indices]

        keep = nms(
            class_boxes,
            class_scores,
            IOU_THRESHOLD
        )

        final_indices.extend(
            indices[keep]
        )

    # ==========================================
    # BUILD RESPONSE
    # ==========================================

    detections = []

    scale_x = original_width / IMG_SIZE
    scale_y = original_height / IMG_SIZE

    for i in final_indices:

        class_id = int(class_ids[i])
        confidence = float(confidences[i])

        box = decoded_boxes[i]

        x1_original = max(
            0,
            min(
                original_width,
                box[0] * scale_x
            )
        )

        y1_original = max(
            0,
            min(
                original_height,
                box[1] * scale_y
            )
        )

        x2_original = max(
            0,
            min(
                original_width,
                box[2] * scale_x
            )
        )

        y2_original = max(
            0,
            min(
                original_height,
                box[3] * scale_y
            )
        )

        detections.append({
            "class_id": class_id,
            "name": CLASS_NAMES[class_id],
            "confidence": round(confidence, 4),
            "box": [
                round(float(x1_original), 2),
                round(float(y1_original), 2),
                round(float(x2_original), 2),
                round(float(y2_original), 2)
            ]
        })

    # confidence cao -> thấp
    detections.sort(
        key=lambda x: x["confidence"],
        reverse=True
    )

    return detections


# ============================================================
# HEALTH
# ============================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "ok",
        "model": "best.onnx",
        "runtime": "ONNX Runtime",
        "device": "CPU"
    })


# ============================================================
# PREDICT API
# ============================================================

@app.route("/predict", methods=["POST"])
def predict_api():

    try:

        if "image" not in request.files:

            return jsonify({
                "success": False,
                "message": "Không có ảnh"
            }), 400

        file = request.files["image"]

        image_bytes = file.read()

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

        detections = predict(image)

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


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
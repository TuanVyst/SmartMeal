import numpy as np
import onnxruntime as ort
from PIL import Image

from smartmeal_predict.config import (
    CLASS_NAMES,
    CONF_THRESHOLD,
    IMG_SIZE,
    IOU_THRESHOLD,
    MODEL_PATH,
)


def nms(boxes: np.ndarray, scores: np.ndarray, iou_threshold: float = IOU_THRESHOLD) -> list[int]:
    if len(boxes) == 0:
        return []

    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]

    areas = np.maximum(0.0, x2 - x1) * np.maximum(0.0, y2 - y1)
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

        w = np.maximum(0.0, xx2 - xx1)
        h = np.maximum(0.0, yy2 - yy1)

        intersection = w * h
        union = areas[i] + areas[order[1:]] - intersection
        iou = intersection / (union + 1e-6)

        order = order[1:][iou < iou_threshold]

    return keep


class Predictor:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.session = ort.InferenceSession(
            self.model_path,
            providers=["CPUExecutionProvider"],
        )
        self.input_name = self.session.get_inputs()[0].name

    def preprocess(self, image: Image.Image) -> tuple[np.ndarray, int, int]:
        original_width, original_height = image.size
        resized = image.resize((IMG_SIZE, IMG_SIZE))
        img = np.array(resized).astype(np.float32) / 255.0

        img = np.transpose(img, (2, 0, 1))
        img = np.expand_dims(img, axis=0)

        return img, original_width, original_height

    def predict(self, image: Image.Image) -> list[dict]:
        img, original_width, original_height = self.preprocess(image)

        outputs = self.session.run(None, {self.input_name: img})
        output = outputs[0][0]

        boxes = output[:4, :]
        class_scores = output[4:, :]

        class_ids = np.argmax(class_scores, axis=0)
        confidences = np.max(class_scores, axis=0)

        mask = confidences >= CONF_THRESHOLD
        boxes = boxes[:, mask]
        class_ids = class_ids[mask]
        confidences = confidences[mask]

        cx = boxes[0]
        cy = boxes[1]
        w = boxes[2]
        h = boxes[3]

        x1 = cx - w / 2
        y1 = cy - h / 2
        x2 = cx + w / 2
        y2 = cy + h / 2

        decoded_boxes = np.stack([x1, y1, x2, y2], axis=1)

        final_indices = []
        for class_id in np.unique(class_ids):
            indices = np.where(class_ids == class_id)[0]
            class_boxes = decoded_boxes[indices]
            cls_scores = confidences[indices]

            keep = nms(class_boxes, cls_scores, IOU_THRESHOLD)
            final_indices.extend(indices[keep])

        detections = []
        scale_x = original_width / IMG_SIZE
        scale_y = original_height / IMG_SIZE

        for i in final_indices:
            class_id = int(class_ids[i])
            confidence = float(confidences[i])
            box = decoded_boxes[i]

            x1_orig = max(0.0, min(float(original_width), float(box[0] * scale_x)))
            y1_orig = max(0.0, min(float(original_height), float(box[1] * scale_y)))
            x2_orig = max(0.0, min(float(original_width), float(box[2] * scale_x)))
            y2_orig = max(0.0, min(float(original_height), float(box[3] * scale_y)))

            detections.append({
                "class_id": class_id,
                "name": CLASS_NAMES[class_id] if class_id < len(CLASS_NAMES) else f"class_{class_id}",
                "confidence": round(confidence, 4),
                "box": [
                    round(x1_orig, 2),
                    round(y1_orig, 2),
                    round(x2_orig, 2),
                    round(y2_orig, 2),
                ],
            })

        detections.sort(key=lambda x: x["confidence"], reverse=True)
        return detections

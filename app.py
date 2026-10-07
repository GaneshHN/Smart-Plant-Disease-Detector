import hashlib
import io
import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from PIL import Image
import numpy as np

try:
    import tensorflow as tf
except ImportError:
    tf = None

app = Flask(__name__)
CORS(app)
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "model", "plant_disease_model.h5")
model = None

LABELS = [
    "Apple Scab",
    "Apple Black Rot",
    "Corn Leaf Blight",
    "Grape Black Rot",
    "Potato Early Blight",
    "Potato Late Blight",
    "Tomato Bacterial Spot",
    "Tomato Late Blight",
    "Healthy"
]

TREATMENTS = {
    "Apple Scab": "Remove infected leaves and apply a fungicide designed for apple trees.",
    "Apple Black Rot": "Prune damaged areas and use a copper-based spray.",
    "Corn Leaf Blight": "Rotate crops and use resistant varieties where available.",
    "Grape Black Rot": "Remove infected fruit and treat vines with protective fungicide.",
    "Potato Early Blight": "Avoid overhead watering and apply appropriate fungicide.",
    "Potato Late Blight": "Use certified seed potatoes and remove infected plants promptly.",
    "Tomato Bacterial Spot": "Remove affected foliage and use copper sprays if allowed.",
    "Tomato Late Blight": "Increase air circulation and apply targeted fungicides.",
    "Healthy": "No treatment required. Continue monitoring plant health regularly."
}

SYMPTOMS = {
    "Apple Scab": "Dark lesions on apple leaves and fruit, often with yellow halos.",
    "Apple Black Rot": "Sharply defined black spots with rotted centers on leaves and fruit.",
    "Corn Leaf Blight": "Large tan lesions appear on corn leaves, often in a cigar shape.",
    "Grape Black Rot": "Purple-black spots form on grape leaves, stems, and fruit.",
    "Potato Early Blight": "Brown circular spots appear on potato leaves with concentric rings.",
    "Potato Late Blight": "Dark, water-soaked lesions spread rapidly over leaves and stems.",
    "Tomato Bacterial Spot": "Small dark lesions appear on tomato leaves and fruit, causing defoliation.",
    "Tomato Late Blight": "Large brown patches develop on tomato foliage and fruit, often with fuzzy growth.",
    "Healthy": "No visible disease symptoms detected.",
}

PREVENTIONS = {
    "Apple Scab": "Prune for airflow, avoid wet foliage, and use resistant cultivars.",
    "Apple Black Rot": "Sanitize tools, remove infected debris, and spray protectively.",
    "Corn Leaf Blight": "Rotate crops, plant resistant hybrids, and reduce leaf wetness.",
    "Grape Black Rot": "Improve vineyard airflow and apply preventive fungicides.",
    "Potato Early Blight": "Avoid overhead irrigation and space plants for good air circulation.",
    "Potato Late Blight": "Use certified seed, remove infected plants, and avoid wet conditions.",
    "Tomato Bacterial Spot": "Rotate crops, sanitize tools, and avoid overhead watering.",
    "Tomato Late Blight": "Keep foliage dry, remove infected plants, and use resistant varieties.",
    "Healthy": "Maintain healthy watering schedule. Monitor for early signs.",
}


def load_model():
    global model
    if model is None and tf is not None and os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
    return model


def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((224, 224))
    image_array = np.array(image).astype("float32") / 255.0
    if image_array.ndim == 2:
        image_array = np.stack([image_array] * 3, axis=-1)
    if image_array.shape[-1] == 4:
        image_array = image_array[..., :3]
    return np.expand_dims(image_array, axis=0)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/predict", methods=["POST"])
@app.route("/predict", methods=["POST"])
def predict():
    data = b""
    try:
        if "leafImage" not in request.files:
            return jsonify({"error": "No image file provided."}), 400

        file = request.files["leafImage"]
        data = file.read()
        try:
            image = Image.open(io.BytesIO(data)).convert("RGB")
        except Exception:
            return jsonify({"error": "Unable to read the uploaded image."}), 400

        processed = preprocess_image(image)
        model_instance = load_model()

        if model_instance is None:
            return jsonify(generate_fallback_prediction(data))

        predictions = model_instance.predict(processed)
        best_index = int(np.argmax(predictions[0]))
        label = LABELS[best_index]
        confidence = float(np.max(predictions[0]))

        return jsonify({
            "status": "success",
            "disease": label,
            "confidence": round(confidence, 4),
            "treatment": TREATMENTS.get(label, "Monitor the plant and consult a specialist if the condition worsens."),
            "symptoms": SYMPTOMS.get(label, "Visual symptoms are present on the leaf."),
            "prevention": PREVENTIONS.get(label, "Maintain healthy crop management practices."),
        })
    except Exception as exc:
        fallback = generate_fallback_prediction(data if isinstance(data, (bytes, bytearray)) else b"")
        fallback["message"] = f"Backend error: {str(exc)}. Returning fallback result."
        return jsonify(fallback), 200


def generate_fallback_prediction(image_bytes):
    hash_value = int(hashlib.sha256(image_bytes).hexdigest(), 16)
    label = LABELS[hash_value % len(LABELS)]
    confidence = 0.70 + (hash_value % 31) / 100.0
    if label == 'Healthy' and hash_value % 3 == 0:
        label = LABELS[(hash_value + 7) % (len(LABELS) - 1)]
    label = label or 'Healthy'
    return {
        "status": "fallback",
        "disease": label,
        "confidence": round(min(confidence, 0.98), 4),
        "treatment": TREATMENTS.get(label, "Monitor the plant and consult a specialist if the condition worsens."),
        "symptoms": SYMPTOMS.get(label, "Observed symptoms match known disease patterns."),
        "prevention": PREVENTIONS.get(label, "Maintain good crop management and monitor daily."),
        "message": "Model file not found. Returning a mock prediction. Place a trained model at model/plant_disease_model.h5 for real predictions.",
    }

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "AgroAI backend is running."})


if __name__ == "__main__":
    app.run(debug=True)


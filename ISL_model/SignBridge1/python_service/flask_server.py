from googletrans import Translator
from collections import deque
prediction_history = deque(maxlen=5)
from function import mediapipe_detection, extract_keypoints, get_detector
from flask import Flask, request, jsonify
from flask_cors import CORS
from detector_utils import detect_sign_heuristic
from keras.models import model_from_json
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
from collections import deque
import logging


translator = Translator()

# ------------------ LOGGING ------------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)



# ------------------ ACTIONS ------------------
actions = np.array(['A', 'B', 'C', 'D', 'E', 'F'])

# ------------------ WORD MAP ------------------
word_map = {
    'HELLO': 'Hello 👋',
    'YES': 'Yes 👍',
    'NO': 'No 👎',
    'THANK_YOU': 'Thank You ❤️',
    'LOVE': 'I Love You 🤟',
    'OKAY': 'Okay 👌',
    'PEACE': 'Peace ✌️',
    'STOP': 'Stop ✋'
}

# ------------------ APP ------------------
app = Flask(__name__)
CORS(app)



print("🚀 Initializing MediaPipe detector...")
detector = get_detector()
print("✅ Detector ready")
# ------------------ LOAD MODEL ------------------
from keras.models import load_model

logger.info("Loading model...")

try:
    model = load_model("model_fixed.h5", compile=False)
    logger.info("✅ Model Loaded Successfully")
except Exception as e:
    import traceback
    logger.error("❌ MODEL LOAD ERROR:")
    traceback.print_exc()
    model = None

# ------------------ PARAMETERS ------------------
SEQUENCE_LENGTH = 10
confidence_threshold = 0.7      # IMPORTANT (your original model likely uses 30)
sequence = []
predictions = []

# ------------------ HEALTH ------------------
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    }), 200


@app.route('/translate-text', methods=['POST'])
def translate_text():
    data = request.json
    text = data.get('text')
    target_lang = data.get('lang', 'en')

    translated = translator.translate(text, dest=target_lang)

    return jsonify({
        "translated_text": translated.text
    })
# ------------------ PREDICT ------------------
@app.route('/predict', methods=['POST'])
def predict():
    global sequence, predictions

    if model is None:
        return jsonify({'success': False, 'message': 'Model not loaded'}), 500

    try:
        data = request.json
        frame_data = data.get('frame') or data.get('frameData')

        if not frame_data:
            return jsonify({'success': False, 'message': 'No frame data'}), 400

        # Strip base64 header
        if 'base64,' in frame_data:
            frame_data = frame_data.split('base64,')[1]

        # Decode image
        image_bytes = base64.b64decode(frame_data)
        image = Image.open(BytesIO(image_bytes)).convert('RGB')
        frame = np.array(image)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

        # MediaPipe detection
        _, results = mediapipe_detection(frame, detector)
        keypoints = extract_keypoints(results)

        hand_detected = bool(np.any(keypoints != 0))

        # ── Mirror EXACTLY what test_model.py does ───────────────────────────
        sequence.append(keypoints)
        sequence = sequence[-SEQUENCE_LENGTH:]   # keep last 30 frames

        logger.info(f"hand={hand_detected} seq={len(sequence)}/30")

        # Warmup: need 30 frames
        if len(sequence) < SEQUENCE_LENGTH:
            while len(sequence) < SEQUENCE_LENGTH:
                sequence.append(np.zeros_like(keypoints))

        # ── Heuristic Detection (Permanent Fix) ──
        h_sign, h_conf = detect_sign_heuristic(keypoints)
        
        # Temporal Smoothing: Keep last 5 heuristic results
        if not hasattr(predict, "h_history"): 
            predict.h_history = deque(maxlen=5)
        
        if h_sign: predict.h_history.append(h_sign)
        else: predict.h_history.append(None)
        
        # Logic: If a sign dominates the last 5 frames, show it
        valid_signs = [s for s in predict.h_history if s is not None]
        if valid_signs:
            # Get most common sign in history
            predicted_action = max(set(valid_signs), key=valid_signs.count)
            # If it appeared in at least 3 of last 5 frames
            if predict.h_history.count(predicted_action) >= 3:
                display_word = word_map.get(predicted_action, predicted_action)
                return jsonify({
                    'success':            True,
                    'requiresMoreFrames': False,
                    'predictedSign':      predicted_action,
                    'mappedWord':         display_word,
                    'confidence':         h_conf,
                    'handDetected':       hand_detected,
                    'message':            'OK (Stable)'
                }), 200

                return jsonify({
                    'success': True,
                    'predictedSign': None,
                    'mappedWord': "",
                    'confidence': 0.0,
                    'handDetected': hand_detected,
                    'message': 'Detecting...'
                }), 200

    except Exception as e:
        logger.error(f"Predict error: {e}", exc_info=True)
        return jsonify({'success': False, 'message': str(e)}), 500

        

        # =========================
        # ✅ HEURISTIC DETECTION (FALLBACK)
        # =========================
        h_sign, h_conf = detect_sign_heuristic(keypoints)

        if not hasattr(predict, "h_history"):
            predict.h_history = deque(maxlen=5)

        predict.h_history.append(h_sign)
        valid_signs = [s for s in predict.h_history if s]

        if valid_signs:
            predicted_action = max(set(valid_signs), key=valid_signs.count)
            if predict.h_history.count(predicted_action) >= 3:
                return jsonify({
                    'success': True,
                    'predictedSign': predicted_action,
                    'mappedWord': word_map.get(predicted_action, predicted_action),
                    'confidence': float(h_conf),
                    'handDetected': hand_detected,
                    'message': 'Heuristic Prediction'
                }), 200

        # =========================
        # DEFAULT RESPONSE
        # =========================
        return jsonify({
            'success': True,
            'predictedSign': None,
            'confidence': 0.0,
            'handDetected': hand_detected,
            'message': 'Detecting...'
        }), 200

    except Exception as e:
        logger.error(f"❌ Predict error: {e}", exc_info=True)
        return jsonify({'success': False, 'message': str(e)}), 500
# ------------------ RESET ------------------
@app.route('/reset', methods=['POST'])
def reset_sequence():
    global sequence, predictions
    sequence = []
    predictions = []
    return jsonify({'success': True})


# ------------------ RUN ------------------
if __name__ == '__main__':
    print("🚀 Starting Flask Server...")
    app.run(host='0.0.0.0', port=5000, debug=False)
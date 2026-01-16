from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import io
from PIL import Image
import os

app = Flask(__name__)
CORS(app)

MODEL_FILENAME = 'cancer_model.h5'  # Changed to match your saved model

# FIXED: Correct class mapping for binary classification
CLASS_NAMES = ['No Tumor', 'Tumor Detected']

print("-----------------------------------")
print(f"Loading AI Model: {MODEL_FILENAME}...")
print("-----------------------------------")

try:
    if not os.path.exists(MODEL_FILENAME):
        raise FileNotFoundError(f"Model file '{MODEL_FILENAME}' not found in {os.getcwd()}")
        
    model = load_model(MODEL_FILENAME)
    print("✅ Model loaded successfully!")
    print("   Server is ready for requests.")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print(f"   Please ensure '{MODEL_FILENAME}' is in the same folder as server.py")
    model = None

def preprocess_image(img_bytes):
    """
    Prepares the uploaded image for the AI model.
    """
    img = Image.open(io.BytesIO(img_bytes))
    
    if img.mode != "RGB":
        img = img.convert("RGB")
    
    target_size = (224, 224)
    img = img.resize(target_size)
    
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    
    return img_array

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Check server logs.'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        processed_img = preprocess_image(file.read())
        
        # Run prediction
        prediction = model.predict(processed_img, verbose=0)
        
        # FIXED: For binary classification with sigmoid activation
        # prediction[0][0] gives a value between 0 and 1
        # Values close to 0 = "no" (no tumor)
        # Values close to 1 = "yes" (tumor detected)
        
        confidence_score = float(prediction[0][0])
        
        # Determine class based on threshold (0.5)
        if confidence_score >= 0.5:
            result_class = CLASS_NAMES[1]  # "Tumor Detected"
            confidence = confidence_score * 100
        else:
            result_class = CLASS_NAMES[0]  # "No Tumor"
            confidence = (1 - confidence_score) * 100
        
        print(f"Raw prediction score: {confidence_score:.4f}")
        print(f"Result: {result_class} ({confidence:.2f}%)")
        
        return jsonify({
            'prediction': result_class,
            'confidence': f"{confidence:.2f}%",
            'raw_score': f"{confidence_score:.4f}"  # Added for debugging
        })
        
    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    return "Brain Tumor Detection API is running!", 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)
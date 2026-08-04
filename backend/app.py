from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import requests
import sys
import os
from dotenv import load_dotenv
load_dotenv()
import joblib
import sqlite3

# Ensure the ml/src directory is in the path
base_dir = os.path.dirname(os.path.abspath(__file__))
ml_src_path = os.path.join(base_dir, '..', 'ml', 'src')
sys.path.append(ml_src_path)

from xai_module import XAIExplainer
from database import init_db, get_db_connection

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

import torch
import torch.nn as nn



class ImageClassificationBase(nn.Module):
    pass

def conv_block(in_channels, out_channels, pool=False):
    layers = [nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1), 
              nn.BatchNorm2d(out_channels), 
              nn.ReLU(inplace=True)]
    if pool: layers.append(nn.MaxPool2d(2))
    return nn.Sequential(*layers)

class ResNet9(ImageClassificationBase):
    def __init__(self, in_channels, num_classes):
        super().__init__()
        self.conv1 = conv_block(in_channels, 64)
        self.conv2 = conv_block(64, 128, pool=True)
        self.res1 = nn.Sequential(conv_block(128, 128), conv_block(128, 128))
        self.conv3 = conv_block(128, 256, pool=True)
        self.conv4 = conv_block(256, 512, pool=True)
        self.res2 = nn.Sequential(conv_block(512, 512), conv_block(512, 512))
        self.classifier = nn.Sequential(nn.MaxPool2d(4), 
                                        nn.Flatten(), 
                                        nn.Dropout(0.2),
                                        nn.Linear(512, num_classes))
        
    def forward(self, xb):
        out = self.conv1(xb)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        out = self.classifier(out)
        return out

# Global instances
explainer = None
fertilizer_model = None
fertilizer_encoder = None
irrigation_model = None
irrigation_encoder = None

# We'll load the PyTorch disease model dynamically when needed
disease_model = None
disease_classes = [
    'Apple Scab', 'Apple Black Rot', 'Apple Cedar Rust', 'Apple Healthy',
    'Blueberry Healthy',
    'Cherry Powdery Mildew', 'Cherry Healthy',
    'Corn Cercospora Leaf Spot / Gray Leaf Spot', 'Corn Common Rust', 'Corn Northern Leaf Blight', 'Corn Healthy',
    'Grape Black Rot', 'Grape Esca (Black Measles)', 'Grape Leaf Blight (Isariopsis Leaf Spot)', 'Grape Healthy',
    'Orange Haunglongbing (Citrus Greening)',
    'Peach Bacterial Spot', 'Peach Healthy',
    'Pepper Bell Bacterial Spot', 'Pepper Bell Healthy',
    'Potato Early Blight', 'Potato Late Blight', 'Potato Healthy',
    'Raspberry Healthy',
    'Soybean Healthy',
    'Squash Powdery Mildew',
    'Strawberry Leaf Scorch', 'Strawberry Healthy',
    'Tomato Bacterial Spot', 'Tomato Early Blight', 'Tomato Late Blight', 'Tomato Leaf Mold',
    'Tomato Septoria Leaf Spot', 'Tomato Spider Mites', 'Tomato Target Spot',
    'Tomato Yellow Leaf Curl Virus', 'Tomato Mosaic Virus', 'Tomato Healthy'
]

# Generative AI removed as per user request

def initialize_models():
    global crop_explainer, fertilizer_explainer, irrigation_explainer
    global fertilizer_model, fertilizer_encoder, fertilizer_ordinal_encoder, fertilizer_features
    global irrigation_model, irrigation_encoder, irrigation_ordinal_encoder, irrigation_features
    try:
        models_dir = os.path.join(base_dir, "..", "ml", "models")
        
        # Crop Recommendation
        crop_model_path = os.path.join(models_dir, "crop_recommendation_model.pkl")
        crop_encoder_path = os.path.join(models_dir, "label_encoder.pkl")
        crop_features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        crop_explainer = XAIExplainer(crop_model_path, crop_encoder_path, crop_features)
        
        # Fertilizer
        fertilizer_model_path = os.path.join(models_dir, "fertilizer_model.pkl")
        fertilizer_encoder_path = os.path.join(models_dir, "fertilizer_label_encoder.pkl")
        
        fertilizer_model = joblib.load(fertilizer_model_path)
        fertilizer_encoder = joblib.load(fertilizer_encoder_path)
        fertilizer_ordinal_encoder = joblib.load(os.path.join(models_dir, "fertilizer_ordinal_encoder.pkl"))
        fertilizer_features = joblib.load(os.path.join(models_dir, "fertilizer_features.pkl"))
        
        fertilizer_explainer = XAIExplainer(fertilizer_model_path, fertilizer_encoder_path, fertilizer_features)

        # Irrigation
        irrigation_model_path = os.path.join(models_dir, "irrigation_model.pkl")
        irrigation_encoder_path = os.path.join(models_dir, "irrigation_label_encoder.pkl")
        
        irrigation_model = joblib.load(irrigation_model_path)
        irrigation_encoder = joblib.load(irrigation_encoder_path)
        irrigation_ordinal_encoder = joblib.load(os.path.join(models_dir, "irrigation_ordinal_encoder.pkl"))
        irrigation_features = joblib.load(os.path.join(models_dir, "irrigation_features.pkl"))
        
        irrigation_explainer = XAIExplainer(irrigation_model_path, irrigation_encoder_path, irrigation_features)
        
        print("All tabular ML models and explainers initialized successfully.")
    except Exception as e:
        print(f"Warning: Could not initialize some models. They might not be trained yet. Error: {e}")
        
    # GenAI initialization removed
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "Healthy"})

# --- Database API Routes ---

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    data = request.json
    db = get_db_connection()
    users_col = db.users
    
    if users_col.find_one({"email": data['email']}):
        return jsonify({"error": "Email already registered"}), 400
        
    try:
        result = users_col.insert_one({
            "email": data['email'], 
            "password": data['password'], 
            "farm_name": data['farmName']
        })
        return jsonify({"message": "Registration successful", "user_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    data = request.json
    db = get_db_connection()
    users_col = db.users
    user = users_col.find_one({"email": data['email'], "password": data['password']})
    
    if user:
        return jsonify({"message": "Login successful", "user": {"id": str(user['_id']), "email": user['email'], "farm_name": user['farm_name']}})
    return jsonify({"error": "Invalid credentials"}), 401


@app.route('/api/logs', methods=['POST'])
def create_farm_log():
    data = request.json
    db = get_db_connection()
    logs_col = db.farm_logs
    logs_col.insert_one({
        "date": data.get('date'),
        "activity_type": data.get('activityType'),
        "field_zone": data.get('fieldZone'),
        "crop_type": data.get('cropType'),
        "resources_used": data.get('resourcesUsed'),
        "notes": data.get('notes')
    })
    return jsonify({"message": "Log entry saved successfully"}), 201

@app.route('/api/reports/yield', methods=['GET'])
def get_yield_reports():
    db = get_db_connection()
    reports_col = db.yield_reports
    reports = list(reports_col.find({}))
    for r in reports:
        r['id'] = str(r.pop('_id'))
    return jsonify(reports)

# --- ML Model API Routes ---

@app.route('/api/predict_crop', methods=['POST'])
def predict_crop():
    global crop_explainer
    if crop_explainer is None:
        initialize_models()
    try:
        data = request.json
        features = [float(data.get(k, 0)) if data.get(k, 0) not in ['', None] else 0.0 for k in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
        shap_result = crop_explainer.explain_with_shap(features)
        return jsonify({
            "recommended_crop": shap_result['prediction'],
            "shap_explanation": shap_result['contributions']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/predict_fertilizer', methods=['POST'])
def predict_fertilizer():
    global fertilizer_model, fertilizer_encoder, fertilizer_ordinal_encoder, fertilizer_features, fertilizer_explainer
    if fertilizer_model is None:
        initialize_models()
    try:
        import pandas as pd
        data = request.json
        df_input = pd.DataFrame([data])
        
        num_cols = ['Soil_pH', 'Soil_Moisture', 'Organic_Carbon', 'Electrical_Conductivity', 
                    'Nitrogen_Level', 'Phosphorus_Level', 'Potassium_Level', 'Temperature', 
                    'Humidity', 'Rainfall', 'Fertilizer_Used_Last_Season', 'Yield_Last_Season']
        cat_cols = ['Soil_Type', 'Crop_Type', 'Crop_Growth_Stage', 'Season', 
                    'Irrigation_Type', 'Previous_Crop', 'Region']
        
        df_num = df_input[num_cols].replace('', 0).astype(float).fillna(0)
        df_cat = df_input[cat_cols].fillna('Unknown')
        
        df_cat_encoded = pd.DataFrame(fertilizer_ordinal_encoder.transform(df_cat), columns=cat_cols)
        X = pd.concat([df_num.reset_index(drop=True), df_cat_encoded.reset_index(drop=True)], axis=1)
        
        X = X[fertilizer_features]
        shap_result = fertilizer_explainer.explain_with_shap(X.iloc[0].tolist())
        
        return jsonify({
            "recommended_fertilizer": shap_result['prediction'],
            "shap_explanation": shap_result['contributions']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/predict_irrigation', methods=['POST'])
def predict_irrigation():
    global irrigation_model, irrigation_encoder, irrigation_ordinal_encoder, irrigation_features, irrigation_explainer
    if irrigation_model is None:
        initialize_models()
    try:
        import pandas as pd
        data = request.json
        df_input = pd.DataFrame([data])
        
        num_cols = ['Soil_pH', 'Soil_Moisture', 'Organic_Carbon', 'Electrical_Conductivity', 
                    'Temperature_C', 'Humidity', 'Rainfall_mm', 'Sunlight_Hours', 
                    'Wind_Speed_kmh', 'Field_Area_hectare', 'Previous_Irrigation_mm']
        cat_cols = ['Soil_Type', 'Crop_Type', 'Crop_Growth_Stage', 'Season', 
                    'Irrigation_Type', 'Water_Source', 'Mulching_Used', 'Region']
        
        df_num = df_input[num_cols].replace('', 0).astype(float).fillna(0)
        df_cat = df_input[cat_cols].fillna('Unknown')
        
        df_cat_encoded = pd.DataFrame(irrigation_ordinal_encoder.transform(df_cat), columns=cat_cols)
        X = pd.concat([df_num.reset_index(drop=True), df_cat_encoded.reset_index(drop=True)], axis=1)
        
        X = X[irrigation_features]
        shap_result = irrigation_explainer.explain_with_shap(X.iloc[0].tolist())
        
        return jsonify({
            "irrigation_need": shap_result['prediction'],
            "shap_explanation": shap_result['contributions']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/detect_disease', methods=['POST'])
def detect_disease():
    global disease_model
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400

    try:
        import torch
        import torchvision.transforms as transforms
        from PIL import Image
        import io

        if disease_model is None:
            model_path = os.path.join(base_dir, "..", "ml", "models", "plant-disease-model-complete.pth")
            disease_model = torch.load(model_path, map_location=torch.device('cpu'), weights_only=False)
            disease_model.eval()

        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        
        # Standard transformations for PyTorch Image Models (ResNet, CNNs etc)
        transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor()
        ])
        
        image_tensor = transform(image).unsqueeze(0)
        
        with torch.no_grad():
            outputs = disease_model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)
            
        # Try to use actual classes if we know them, else generic
        predicted_class_name = f"Class {predicted_idx.item()}"
        if predicted_idx.item() < len(disease_classes):
            predicted_class_name = disease_classes[predicted_idx.item()]

        return jsonify({
            "disease": predicted_class_name,
            "confidence": f"{confidence.item() * 100:.2f}%"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


from datetime import datetime

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        db = get_db_connection()
        history_col = db.history
        # Mongita sometimes has issues with projection dicts, filter in python
        records = list(history_col.find({}))
        for r in records:
            if '_id' in r:
                r['id'] = str(r.pop('_id'))
        # Sort by timestamp descending (rough sort by assuming string format for now, or just reverse)
        records.reverse() 
        return jsonify(records)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/save_history', methods=['POST'])
def save_history():
    try:
        data = request.json
        db = get_db_connection()
        history_col = db.history
        
        record = {
            "timestamp": datetime.now().strftime("%b %d, %I:%M %p"),
            "location": data.get("location", "Unknown Location"),
            "type": data.get("type", "Manual"),
            "npk": data.get("npk", "--:--:--"),
            "status": data.get("status", "Pending"),
            "formData": data.get("formData", {})
        }
        
        record_id = data.get("id")
        if record_id:
            try:
                from bson.objectid import ObjectId
                history_col.update_one({"_id": ObjectId(record_id)}, {"$set": record})
                record['id'] = record_id
                return jsonify({"success": True, "record": record})
            except Exception as e:
                print("Update failed, falling back to insert:", e)
                
        res = history_col.insert_one(record)
        record['id'] = str(res.inserted_id)
        if '_id' in record:
            del record['_id']
        return jsonify({"success": True, "record": record})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from bson.objectid import ObjectId

@app.route('/api/history/<record_id>', methods=['DELETE'])
def delete_history(record_id):
    try:
        db = get_db_connection()
        history_col = db.history
        result = history_col.delete_one({"_id": ObjectId(record_id)})
        if result.deleted_count == 1:
            return jsonify({"success": True, "message": "Record deleted"})
        else:
            return jsonify({"error": "Record not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/history/<record_id>/advisory', methods=['POST'])
def save_advisory(record_id):
    try:
        data = request.json
        db = get_db_connection()
        history_col = db.history
        from bson.objectid import ObjectId
        result = history_col.update_one(
            {"_id": ObjectId(record_id)},
            {"$set": {"advisoryResults": data}}
        )
        if result.modified_count == 1 or result.matched_count == 1:
            return jsonify({"success": True, "message": "Advisory saved successfully"})
        return jsonify({"error": "Record not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/image', methods=['GET'])
def get_image():
    query = request.args.get('query', 'farm')
    try:
        from duckduckgo_search import DDGS
        results = DDGS().images(keywords=f"{query} crop farm agriculture high resolution", max_results=1)
        if results and len(results) > 0:
            return redirect(results[0]['image'])
        return redirect(f"https://picsum.photos/seed/{query}/800/400")
    except Exception as e:
        print("Image search error:", e)
        return redirect(f"https://picsum.photos/seed/{query}/800/400")

@app.route('/api/dashboard_summary', methods=['GET'])
def get_dashboard_summary():
    try:
        db = get_db_connection()
        history_col = db.history
        all_plots = list(history_col.find({}))
        for p in all_plots:
            p.pop('_id', None)
            
        # Default to some standard plot if no history
        latest_plot = {"location": "Central Orchard Area", "npk": "120:40:80", "status": "Optimal"}
        lat = 20.5937
        lon = 78.9629


        if len(all_plots) > 0:
            latest_plot = all_plots[-1] # The most recently saved
            
        # Optional: Extract NPK for average calculation
        total_n, total_p, total_k = 0, 0, 0
        valid_plots = 0
        for p in all_plots:
            npk = p.get('npk', '')
            if npk and ':' in npk:
                try:
                    n, p_val, k = map(int, npk.split(':'))
                    total_n += n
                    total_p += p_val
                    total_k += k
                    valid_plots += 1
                except:
                    pass
                    
        avg_npk = "100:50:50" # Default
        if valid_plots > 0:
            avg_npk = f"{total_n//valid_plots}:{total_p//valid_plots}:{total_k//valid_plots}"

        # Fetch live weather for the dashboard using Open-Meteo
        weather_data = {
            "temp": 24, 
            "condition": "Partly Cloudy", 
            "rain_chance": 15,
            "hourly": [50, 66, 100, 75, 50]
        }
        try:
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code,precipitation_probability"
            res = requests.get(weather_url, timeout=5)
            if res.status_code == 200:
                w_json = res.json()
                temp = w_json.get('current', {}).get('temperature_2m', 24)
                rain_prob = w_json.get('current', {}).get('precipitation_probability', 15)
                weather_code = w_json.get('current', {}).get('weather_code', 0)
                
                condition = "Clear"
                if weather_code > 0: condition = "Partly Cloudy"
                if weather_code > 45: condition = "Fog"
                if weather_code > 50: condition = "Rain"
                if weather_code > 70: condition = "Snow"
                if weather_code > 90: condition = "Thunderstorm"
                
                weather_data = {"temp": temp, "condition": condition, "rain_chance": rain_prob, "hourly": [50, 66, 100, 75, 50]}
        except Exception as e:
            print("Weather fetch failed:", e)
            pass

        return jsonify({
            "latest_plot": latest_plot,
            "total_plots_managed": len(all_plots),
            "average_npk": avg_npk,
            "weather": weather_data,
            "moisture_trend": [60, 65, 62, 58, 70, 72, 68]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate_advice', methods=['POST'])
def generate_advice():
    data = request.json
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return jsonify({"advice": "GROQ_API_KEY environment variable is not set. Please get a free API key from console.groq.com, set it in your environment, and restart the backend."})

    prompt = f"""
    You are an expert agronomist AI. The farmer has a plot with the following conditions:
    - Crop ML Recommendation: {data.get('crop')} (Key drivers: {data.get('crop_reasoning')})
    - Fertilizer ML Recommendation: {data.get('fertilizer')} (Key drivers: {data.get('fertilizer_reasoning')})
    - Irrigation ML Recommendation: {data.get('irrigation')} (Key drivers: {data.get('irrigation_reasoning')})
    - Soil NPK: {data.get('N')}:{data.get('P')}:{data.get('K')}
    - Soil pH: {data.get('ph')}
    - Temperature: {data.get('temperature')}C
    - Rainfall: {data.get('rainfall')}mm

    You MUST output your answer in valid JSON format. The JSON object must have exactly these 5 keys. 
    Each key must map to an object containing "title" and "information":

    1. "health_score": {{ "title": "Smart Farm Health Score", "information": "Calculate a Farm Health Score (0-100)... List key metrics (Soil Health, Water Availability, Nutrient Balance) with ✅ or ⚠ emojis." }}
    2. "reasoning": {{ "title": "AI Reasoning", "information": "Explain in plain English exactly WHY the ML models recommended this specific crop based on the telemetry." }}
    3. "calendar": {{ "title": "Growth Stage Calendar", "information": "Provide a comprehensive Markdown table detailing every week/phase of the crop lifecycle and what to do." }}
    4. "pests": {{ "title": "Predictive Pest & Disease Warning", "information": "Predict the top 2 diseases/pests most likely to occur based on weather, and provide prevention tips." }}
    5. "economics": {{ "title": "Economic & Yield Estimation", "information": "Estimate the yield per hectare and actionable optimization tips for profit." }}

    Ensure every "information" value is a detailed string formatted with Markdown (bolding, bullet points, tables). Return ONLY the JSON object.
    """

    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "openai/gpt-oss-120b",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 2048,
            "response_format": {"type": "json_object"}
        }
        
        resp = requests.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)
        if resp.status_code == 200:
            result = resp.json()
            advice_str = result['choices'][0]['message']['content']
            import json
            try:
                advice_json = json.loads(advice_str)
                return jsonify({"advice": advice_json})
            except Exception as e:
                return jsonify({"advice": f"Failed to parse JSON: {str(e)}", "raw": advice_str}), 500
        else:
            return jsonify({"advice": f"API Error: {resp.text}"}), 500
    except Exception as e:
        return jsonify({"advice": f"Error connecting to AI API: {str(e)}"}), 500

if __name__ == '__main__':
    initialize_models()
    app.run(debug=True, port=5000)

import os
import re

app_path = r"d:\Softmade\Project-1\backend\app.py"

with open(app_path, "r") as f:
    content = f.read()

# Update initialize_models
init_models_new = """def initialize_models():
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
        
    # Start GenAI init in the background to not block the main startup
    import threading
    threading.Thread(target=initialize_genai).start()"""

content = re.sub(r'def initialize_models\(\):.*?threading\.Thread\(target=initialize_genai\)\.start\(\)', init_models_new, content, flags=re.DOTALL)

# Update predict_crop
new_predict_crop = """@app.route('/api/predict_crop', methods=['POST'])
def predict_crop():
    global crop_explainer
    if crop_explainer is None:
        initialize_models()
    try:
        data = request.json
        features = [data.get(k, 0) for k in ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
        shap_result = crop_explainer.explain_with_shap(features)
        return jsonify({
            "recommended_crop": shap_result['prediction'],
            "shap_explanation": shap_result['contributions']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400"""

content = re.sub(r'@app\.route\(\'/api/predict_crop\'.*?return jsonify\(\{"error": str\(e\)\}\), 400', new_predict_crop, content, flags=re.DOTALL)

# Update predict_fertilizer
new_predict_fert = """@app.route('/api/predict_fertilizer', methods=['POST'])
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
        
        df_num = df_input[num_cols].astype(float).fillna(0)
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
        return jsonify({"error": str(e)}), 400"""

content = re.sub(r'@app\.route\(\'/api/predict_fertilizer\'.*?return jsonify\(\{"error": str\(e\)\}\), 400', new_predict_fert, content, flags=re.DOTALL)

# Update predict_irrigation
new_predict_irr = """@app.route('/api/predict_irrigation', methods=['POST'])
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
        
        df_num = df_input[num_cols].astype(float).fillna(0)
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
        return jsonify({"error": str(e)}), 400"""

content = re.sub(r'@app\.route\(\'/api/predict_irrigation\'.*?return jsonify\(\{"error": str\(e\)\}\), 400', new_predict_irr, content, flags=re.DOTALL)

with open(app_path, "w") as f:
    f.write(content)
print("Updated app.py successfully")

import os
import joblib
import shap
import pandas as pd
import numpy as np

class XAIExplainer:
    def __init__(self, model_path, encoder_path, feature_names):
        """
        Initializes the generic XAI module with SHAP.
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")
        if not os.path.exists(encoder_path):
            raise FileNotFoundError(f"Encoder not found at {encoder_path}")
            
        self.model = joblib.load(model_path)
        self.label_encoder = joblib.load(encoder_path)
        self.feature_names = feature_names
        
        # Initialize SHAP explainer
        self.shap_explainer = shap.TreeExplainer(self.model)

    def explain_with_shap(self, input_data):
        """
        Explain a single prediction using SHAP.
        input_data: list or numpy array of features 
        """
        df_input = pd.DataFrame([input_data], columns=self.feature_names)
        
        # Get SHAP values
        shap_values = self.shap_explainer.shap_values(df_input)
        
        # For multi-class classification, shap_values might be a list of arrays (one per class).
        # We need to find the predicted class first
        pred_encoded = self.model.predict(df_input)[0]
        predicted_class = self.label_encoder.inverse_transform([pred_encoded])[0]
        
        # Extract the SHAP values for the predicted class
        if isinstance(shap_values, list):
            class_shap_values = shap_values[pred_encoded][0]
        elif len(shap_values.shape) == 3: # Some versions of SHAP return 3D arrays
            class_shap_values = shap_values[0, :, pred_encoded]
        else:
            class_shap_values = shap_values[0]

        # Combine with feature names
        contributions = dict(zip(self.feature_names, class_shap_values))
        
        # Sort by absolute contribution
        sorted_contributions = sorted(contributions.items(), key=lambda x: abs(x[1]), reverse=True)
        
        return {
            "prediction": predicted_class,
            "contributions": sorted_contributions
        }

if __name__ == "__main__":
    # Test script with mock data
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    model_path = os.path.join(base_dir, "ml", "models", "crop_recommendation_model.pkl")
    encoder_path = os.path.join(base_dir, "ml", "models", "label_encoder.pkl")
    
    if os.path.exists(model_path):
        features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        explainer = XAIExplainer(model_path, encoder_path, features)
        
        mock_input = [90, 42, 43, 20.8, 82.0, 6.5, 202.9]
        res = explainer.explain_with_shap(mock_input)
        print("SHAP Results:")
        print(res)
    else:
        print("Model not found to test.")

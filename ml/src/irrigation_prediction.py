import pandas as pd
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder
import joblib

def train_irrigation_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(base_dir, "data", "datasets", "irrigation_prediction.csv")
    model_dir = os.path.join(base_dir, "ml", "models")
    
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)

    # 1. Define Features
    num_cols = ['Soil_pH', 'Soil_Moisture', 'Organic_Carbon', 'Electrical_Conductivity', 
                'Temperature_C', 'Humidity', 'Rainfall_mm', 'Sunlight_Hours', 
                'Wind_Speed_kmh', 'Field_Area_hectare', 'Previous_Irrigation_mm']
    
    cat_cols = ['Soil_Type', 'Crop_Type', 'Crop_Growth_Stage', 'Season', 
                'Irrigation_Type', 'Water_Source', 'Mulching_Used', 'Region']
                
    # 2. Encode Categorical Features
    ordinal_encoder = OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1)
    df_cat_encoded = pd.DataFrame(ordinal_encoder.fit_transform(df[cat_cols]), columns=cat_cols)
    
    # Combine numerical and encoded categorical
    X = pd.concat([df[num_cols], df_cat_encoded], axis=1)
    
    # 3. Encode Target
    y = df['Irrigation_Need']
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    print("Training RandomForest for Irrigation Prediction...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y_encoded)

    # Save the models and encoders
    joblib.dump(clf, os.path.join(model_dir, "irrigation_model.pkl"))
    joblib.dump(label_encoder, os.path.join(model_dir, "irrigation_label_encoder.pkl"))
    joblib.dump(ordinal_encoder, os.path.join(model_dir, "irrigation_ordinal_encoder.pkl"))
    
    # Save feature names
    joblib.dump(list(X.columns), os.path.join(model_dir, "irrigation_features.pkl"))
    
    print("Irrigation model saved successfully!")

if __name__ == "__main__":
    train_irrigation_model()

import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib

def train_models():
    # Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(base_dir, "data", "datasets", "Crop Recommendation dataset.csv")
    model_dir = os.path.join(base_dir, "ml", "models")
    
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)

    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)

    # Features and target
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']

    # Label encode target for XGBoost (which requires numeric labels in newer versions)
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # Split the dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

    print("Training Random Forest...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    print(f"Random Forest Accuracy: {rf_acc:.4f}")

    print("Training XGBoost...")
    xgb_model = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
    xgb_model.fit(X_train, y_train)
    xgb_preds = xgb_model.predict(X_test)
    xgb_acc = accuracy_score(y_test, xgb_preds)
    print(f"XGBoost Accuracy: {xgb_acc:.4f}")

    # Determine best model
    best_model = rf_model if rf_acc >= xgb_acc else xgb_model
    best_model_name = "RandomForest" if rf_acc >= xgb_acc else "XGBoost"
    print(f"Best model is {best_model_name} with accuracy {max(rf_acc, xgb_acc):.4f}")

    # Save the best model and the label encoder
    model_path = os.path.join(model_dir, "crop_recommendation_model.pkl")
    encoder_path = os.path.join(model_dir, "label_encoder.pkl")
    
    joblib.dump(best_model, model_path)
    joblib.dump(label_encoder, encoder_path)
    
    print(f"Saved model to {model_path}")
    print(f"Saved label encoder to {encoder_path}")

if __name__ == "__main__":
    train_models()

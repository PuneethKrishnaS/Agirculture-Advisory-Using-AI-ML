# Running the Machine Learning Models Standalone

This guide explains how to run the Machine Learning components of the AgriSmart AI Labs platform independently from the web backend and frontend.

## Prerequisites

- **Python 3.8+** installed on your system.
- Ensure you have activated your virtual environment if you are using one.

To create and activate a virtual environment:
```powershell
# Create virtual environment
python -m venv venv

# Activate it (Windows)
.\venv\Scripts\activate
```

## Installing Dependencies

The ML models require several data science libraries. Install them via:
```powershell
pip install pandas numpy scikit-learn xgboost lightgbm catboost joblib shap
```
*(If a `requirements.txt` is present in the `ml` folder, you can run `pip install -r ml/requirements.txt` instead).*

## Repository Structure

The ML logic is primarily contained in:
- `ml/src/`: Contains the individual prediction scripts.
  - `crop_recommendation.py`
  - `fertilizer_recommendation.py`
  - `irrigation_prediction.py`
  - `disease_detection.py`
  - `xai_module.py` (Explainable AI using SHAP)
- `ml/models/`: Contains the pre-trained `.pkl` models and scalers.
- `demo_inference.py`: A unified standalone script to test all models with sample data.

## Running the Demo Inference

The quickest way to test the models is to run the demo inference script located in the root directory.

```powershell
python demo_inference.py
```

This script will:
1. Load dummy/sample agricultural data.
2. Feed the data through the Crop, Fertilizer, and Irrigation models.
3. Output the predictions directly to your terminal.
4. Generate SHAP explainability values to show which features most influenced the predictions.

## Using Individual Modules

If you want to integrate or test a specific module programmatically, you can import them from `ml/src`.

### Example: Crop Recommendation
```python
import sys
sys.path.append('./ml/src')
from crop_recommendation import predict_crop

# Sample telemetry data
telemetry = {
    'N': 90,
    'P': 42,
    'K': 43,
    'temperature': 20.8,
    'humidity': 82.0,
    'ph': 6.5,
    'rainfall': 202.9
}

crop, shap_values = predict_crop(telemetry)
print(f"Recommended Crop: {crop}")
```

### Explanation (XAI)
Each of the core prediction scripts utilizes `xai_module.py` under the hood. When a prediction is made, it returns both the predicted class/value and a dictionary of SHAP values. These SHAP values dictate the "Feature Impact" (e.g., how much Nitrogen contributed to the specific recommendation).

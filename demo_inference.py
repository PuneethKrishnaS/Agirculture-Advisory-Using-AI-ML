import pandas as pd
import joblib
import os
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image

# --- ANSI Colors ---
RESET = "\033[0m"
BOLD = "\033[1m"
GREEN = "\033[92m"
BLUE = "\033[94m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RED = "\033[91m"
MAGENTA = "\033[95m"
BG_BLUE = "\033[44m"
WHITE = "\033[97m"
DIM = "\033[2m"

# --- PyTorch Model Classes ---
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
# ----------------------------

base_dir = os.path.dirname(os.path.abspath(__file__))

def get_data_input(df, num_cols, cat_cols=None):
    if cat_cols is None:
        cat_cols = []
    features_cols = num_cols + cat_cols
    
    print(f"\n{BOLD}{CYAN}--- Data Input Options ---{RESET}")
    print(f"{CYAN}[1]{RESET} Predefined (Random sample from dataset)")
    print(f"{CYAN}[2]{RESET} Predefined but custom (Load random sample and modify values)")
    print(f"{CYAN}[3]{RESET} Completely custom data (Enter all values manually)")
    
    while True:
        choice = input(f"\n{BOLD}Select an option (1-3) [{RESET}1{BOLD}]: {RESET}").strip()
        if not choice: choice = '1'
        if choice in ['1', '2', '3']:
            break
        print(f"{RED}Invalid choice. Please enter 1, 2, or 3.{RESET}")
    
    if choice == '1':
        sample = df.sample(1)
        return sample, sample.copy()
        
    elif choice == '2':
        sample = df.sample(1)
        modified = sample.copy()
        
        print(f"\n{BOLD}{MAGENTA}--- Current Values ---{RESET}")
        for col in features_cols:
            print(f"{DIM}{col:<25}{RESET} : {BOLD}{sample.iloc[0][col]}{RESET}")
            
        print(f"\n{BOLD}{YELLOW}Enter new values or press Enter to keep current:{RESET}")
        
        for col in num_cols:
            val = input(f"{CYAN}{col}{RESET} [{sample.iloc[0][col]}]: ").strip()
            if val:
                try:
                    modified.at[modified.index[0], col] = float(val)
                except ValueError:
                    print(f"{RED}Invalid number. Keeping original.{RESET}")
                    
        for col in cat_cols:
            val = input(f"{CYAN}{col}{RESET} [{sample.iloc[0][col]}]: ").strip()
            if val:
                modified.at[modified.index[0], col] = val
            
        return sample, modified
        
    elif choice == '3':
        print(f"\n{BOLD}{YELLOW}--- Enter Custom Data ---{RESET}")
        custom_data = {}
        for col in num_cols:
            while True:
                val = input(f"{CYAN}{col}{RESET}: ").strip()
                try:
                    custom_data[col] = [float(val)]
                    break
                except ValueError:
                    print(f"{RED}Please enter a valid number.{RESET}")
                    
        for col in cat_cols:
            val = input(f"{CYAN}{col}{RESET}: ").strip()
            custom_data[col] = [val]
            
        return pd.DataFrame(custom_data), pd.DataFrame(custom_data)

def display_results(model_name, original_sample, final_input, true_label_col, predicted_label, num_cols, cat_cols=None):
    if cat_cols is None:
        cat_cols = []
    features_cols = num_cols + cat_cols
    
    print(f"\n{BOLD}{MAGENTA}--- Final Inputs for {model_name} ---{RESET}")
    for col in features_cols:
        print(f"{DIM}{col:<25}{RESET} : {GREEN}{final_input.iloc[0][col]}{RESET}")
        
    print(f"\n{'-'*50}")
    if original_sample is not None and true_label_col in original_sample.columns:
        true_label = original_sample[true_label_col].values[0]
        print(f"Original True Label (before edits): {BOLD}{true_label}{RESET}")
        
    print(f"{BG_BLUE}{WHITE}{BOLD} >> PREDICTED: {str(predicted_label).upper()} << {RESET}")
    print(f"{'-'*50}")


def run_crop_recommendation():
    print(f"\n{BOLD}{GREEN}=================================================={RESET}")
    print(f"{BOLD}{GREEN}--- 1. CROP RECOMMENDATION MODEL ---{RESET}")
    print(f"{DIM}Goal: Recommends the best crop based on soil and weather conditions.{RESET}")
    print(f"{BOLD}{GREEN}=================================================={RESET}")
    
    data_path = os.path.join(base_dir, "data", "datasets", "Crop Recommendation dataset.csv")
    model_path = os.path.join(base_dir, "ml", "models", "crop_recommendation_model.pkl")
    encoder_path = os.path.join(base_dir, "ml", "models", "label_encoder.pkl")

    model = joblib.load(model_path)
    label_encoder = joblib.load(encoder_path)
    df = pd.read_csv(data_path)
    num_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

    original_sample, final_input = get_data_input(df, num_cols)
    
    prediction_encoded = model.predict(final_input[num_cols])
    predicted_label = label_encoder.inverse_transform(prediction_encoded)[0]
    
    display_results("Crop Recommendation", original_sample, final_input, 'label', predicted_label, num_cols)


def run_fertilizer_recommendation():
    print(f"\n{BOLD}{YELLOW}=================================================={RESET}")
    print(f"{BOLD}{YELLOW}--- 2. FERTILIZER RECOMMENDATION MODEL ---{RESET}")
    print(f"{DIM}Goal: Recommends the optimal fertilizer based on soil makeup and current crop.{RESET}")
    print(f"{BOLD}{YELLOW}=================================================={RESET}")
    
    data_path = os.path.join(base_dir, "data", "datasets", "fertilizer_recommendation.csv")
    model_path = os.path.join(base_dir, "ml", "models", "fertilizer_model.pkl")
    label_encoder_path = os.path.join(base_dir, "ml", "models", "fertilizer_label_encoder.pkl")
    ordinal_encoder_path = os.path.join(base_dir, "ml", "models", "fertilizer_ordinal_encoder.pkl")

    df = pd.read_csv(data_path)
    num_cols = ['Soil_pH', 'Soil_Moisture', 'Organic_Carbon', 'Electrical_Conductivity', 
                'Nitrogen_Level', 'Phosphorus_Level', 'Potassium_Level', 'Temperature', 
                'Humidity', 'Rainfall', 'Fertilizer_Used_Last_Season', 'Yield_Last_Season']
    cat_cols = ['Soil_Type', 'Crop_Type', 'Crop_Growth_Stage', 'Season', 
                'Irrigation_Type', 'Previous_Crop', 'Region']

    model = joblib.load(model_path)
    label_encoder = joblib.load(label_encoder_path)
    ordinal_encoder = joblib.load(ordinal_encoder_path)

    original_sample, final_input = get_data_input(df, num_cols, cat_cols)
    
    df_cat_encoded = pd.DataFrame(ordinal_encoder.transform(final_input[cat_cols]), columns=cat_cols)
    num_df = final_input[num_cols].reset_index(drop=True)
    df_cat_encoded = df_cat_encoded.reset_index(drop=True)
    X = pd.concat([num_df, df_cat_encoded], axis=1)

    prediction_encoded = model.predict(X)
    predicted_label = label_encoder.inverse_transform(prediction_encoded)[0]
    
    display_results("Fertilizer Recommendation", original_sample, final_input, 'Recommended_Fertilizer', predicted_label, num_cols, cat_cols)


def run_irrigation_prediction():
    print(f"\n{BOLD}{BLUE}=================================================={RESET}")
    print(f"{BOLD}{BLUE}--- 3. IRRIGATION PREDICTION MODEL ---{RESET}")
    print(f"{DIM}Goal: Predicts if the crop needs irrigation (Low, Medium, High).{RESET}")
    print(f"{BOLD}{BLUE}=================================================={RESET}")
    
    data_path = os.path.join(base_dir, "data", "datasets", "irrigation_prediction.csv")
    model_path = os.path.join(base_dir, "ml", "models", "irrigation_model.pkl")
    label_encoder_path = os.path.join(base_dir, "ml", "models", "irrigation_label_encoder.pkl")
    ordinal_encoder_path = os.path.join(base_dir, "ml", "models", "irrigation_ordinal_encoder.pkl")

    df = pd.read_csv(data_path)
    num_cols = ['Soil_pH', 'Soil_Moisture', 'Organic_Carbon', 'Electrical_Conductivity', 
                'Temperature_C', 'Humidity', 'Rainfall_mm', 'Sunlight_Hours', 
                'Wind_Speed_kmh', 'Field_Area_hectare', 'Previous_Irrigation_mm']
    cat_cols = ['Soil_Type', 'Crop_Type', 'Crop_Growth_Stage', 'Season', 
                'Irrigation_Type', 'Water_Source', 'Mulching_Used', 'Region']

    model = joblib.load(model_path)
    label_encoder = joblib.load(label_encoder_path)
    ordinal_encoder = joblib.load(ordinal_encoder_path)

    original_sample, final_input = get_data_input(df, num_cols, cat_cols)

    df_cat_encoded = pd.DataFrame(ordinal_encoder.transform(final_input[cat_cols]), columns=cat_cols)
    num_df = final_input[num_cols].reset_index(drop=True)
    df_cat_encoded = df_cat_encoded.reset_index(drop=True)
    X = pd.concat([num_df, df_cat_encoded], axis=1)

    prediction_encoded = model.predict(X)
    predicted_label = label_encoder.inverse_transform(prediction_encoded)[0]
    
    display_results("Irrigation Prediction", original_sample, final_input, 'Irrigation_Need', predicted_label, num_cols, cat_cols)


def run_disease_detection():
    print(f"\n{BOLD}{RED}=================================================={RESET}")
    print(f"{BOLD}{RED}--- 4. DISEASE DETECTION MODEL (PyTorch) ---{RESET}")
    print(f"{DIM}Goal: Identifies plant diseases from leaf images.{RESET}")
    print(f"{BOLD}{RED}=================================================={RESET}")
    
    model_path = os.path.join(base_dir, "ml", "models", "plant-disease-model-complete.pth")
    image_path = os.path.join(base_dir, "data", "sample_images", "TomatoYellowCurlVirus2.jpg")
    
    try:
        print(f"{DIM}Loading model and processing image...{RESET}")
        model = torch.load(model_path, map_location=torch.device('cpu'), weights_only=False)
        model.eval()
        
        image = Image.open(image_path).convert('RGB')
        transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
        ])
        image_tensor = transform(image).unsqueeze(0)
        
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, 0)
        
        print(f"\n{BOLD}Image loaded from:{RESET} {image_path}")
        print(f"{BOLD}Processed into Tensor of shape:{RESET} {CYAN}{list(image_tensor.shape)}{RESET}")
        
        print(f"\n{'-'*50}")
        print(f"{BG_BLUE}{WHITE}{BOLD} >> Predicted class index: {predicted_idx.item()} (Confidence: {confidence.item():.2f}) << {RESET}")
        print(f"{'-'*50}")
                            
    except Exception as e:
        print(f"{RED}{BOLD}Error loading disease model:{RESET} {e}")


if __name__ == "__main__":
    import warnings
    warnings.filterwarnings("ignore")
    
    import platform
    if platform.system() == 'Windows':
        os.system('color') # Enable ANSI escape sequences on Windows Command Prompt
    
    while True:
        print("\n")
        print(f"{BG_BLUE}{WHITE}{BOLD}             CROP PREDICTION ML SYSTEM             {RESET}")
        print(f"{GREEN}[1]{RESET} Crop Recommendation")
        print(f"{YELLOW}[2]{RESET} Fertilizer Recommendation")
        print(f"{BLUE}[3]{RESET} Irrigation Prediction")
        print(f"{RED}[4]{RESET} Disease Detection {DIM}(Predefined demo){RESET}")
        print(f"{DIM}[5] Exit{RESET}")
        
        choice = input(f"\n{BOLD}Which model would you like to run? (1-5): {RESET}").strip()
        
        if choice == '1':
            run_crop_recommendation()
        elif choice == '2':
            run_fertilizer_recommendation()
        elif choice == '3':
            run_irrigation_prediction()
        elif choice == '4':
            run_disease_detection()
        elif choice == '5':
            print(f"{DIM}Exiting...{RESET}")
            break
        else:
            print(f"{RED}Invalid choice. Please enter 1-5.{RESET}")

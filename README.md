<div align="center">
  <h1>🌱 AgriSmart AI Labs</h1>
  <p><strong>An Enterprise-Grade Agricultural Intelligence Platform powered by Machine Learning and Generative AI.</strong></p>
</div>

---

## 📖 Overview

AgriSmart AI Labs is a comprehensive, full-stack platform designed to provide intelligent, data-driven farming advisory. It seamlessly integrates a modern React frontend with a robust Python/Flask backend, executing multiple concurrent Machine Learning models (Crop Recommendation, Fertilizer Requirement, Irrigation Needs, and Disease Detection) and explaining them through SHAP. 

At the core is the **AI Agronomist Deep Dive**, powered by Groq's blazing-fast LLMs, which interprets the ML telemetry and SHAP values into actionable, human-readable farming strategies that can be persistently saved to the database.

## ✨ Key Features

- **Concurrent ML Pipelines:** Predicts optimal crops, fertilizers, and irrigation simultaneously using trained ensemble models.
- **Explainable AI (XAI):** Visualizes *why* the ML model made its prediction using SHAP (Shapley Additive exPlanations) directly in the UI via Recharts.
- **Generative AI Deep Dive:** Integrates with Groq API (Llama 3) to generate comprehensive lifecycle strategies, economic yields, and farm health scores based on your telemetry.
- **Interactive Mapping:** Built-in Leaflet maps featuring high-resolution Google Satellite imagery and polygon drawing for accurate plot management and area calculation.
- **Computer Vision:** Plant disease detection powered by PyTorch (ResNet9).
- **Persistent Plot Management:** Save your ML results, AI reports, and mapped polygon points to a local database (Mongita) for instant retrieval across sessions.
- **Interactive UI:** A highly polished, modern React frontend using Tailwind CSS v4, featuring dynamic image fetching, micro-animations, and a responsive Master Dashboard.

## 🏗️ Architecture Stack

- **Frontend:** React, Vite, Tailwind CSS v4, Recharts, React-Leaflet.
- **Backend:** Python, Flask, Mongita (local MongoDB equivalent).
- **Machine Learning:** Scikit-Learn, XGBoost, PyTorch, SHAP, Joblib.
- **Deployment:** Docker & Docker Compose

---

## 🔑 Step 0: Get Your API Keys

To use the Generative AI "Deep Dive" capabilities within the application, you must provide a free Groq API key before starting the app.

1. **Get your free API Key** at the [Groq API Console](https://console.groq.com).
2. Keep this key handy, as you will need to add it to either the `docker-compose.yml` file (for Docker) or a local `.env` file (for Manual Setup) in the steps below.

---

## 🚀 Installation Option 1: Docker (Recommended)

The easiest way to run this application is via Docker, which completely handles all dependencies (Python, Node, Databases) for you automatically.

### Prerequisites
- [**Download & Install Docker Desktop**](https://www.docker.com/products/docker-desktop/)

### 1. Add your Groq API Key
Open the `docker-compose.yml` file in the root folder using a text editor. Add your API key under the `backend` environment variables:
```yaml
    environment:
      - PORT=5000
      - GROQ_API_KEY=your_groq_key_here
```

### 2. Start the Application
Open a terminal (Command Prompt or PowerShell) inside the main project folder (the folder containing the `docker-compose.yml` file).
*(Tip for Windows: Open the folder in File Explorer, click the address bar at the top, type `cmd`, and press Enter).*

Run the following command:
```bash
docker-compose up --build -d
```
*(Note: This may take several minutes the first time as it downloads the base images and large ML dependencies like PyTorch).*

### 3. Access the Application
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Status:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🛠️ Installation Option 2: Manual Setup

If you prefer to run the application directly on your host machine without Docker, follow these explicit instructions. 

### Prerequisites (Version Compatibility is STRICT)
To ensure the Machine Learning packages (like Pandas 3.0 and PyTorch) compile correctly, you **must** use the following exact versions:
- [**Node.js (v22.14.0)**](https://nodejs.org/en/download/) and **npm** (v11.6.0+)
- [**Python (v3.12.6)**](https://www.python.org/downloads/release/python-3126/)

### 1. Add your Groq API Key
1. Create a new text file named `.env` inside the `backend/` directory.
2. Add the following line to the `.env` file:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Backend & ML Setup
Open a terminal (Command Prompt or PowerShell) inside the main project folder (the folder containing `requirements.txt`).
*(Tip for Windows: Open the folder in File Explorer, click the address bar at the top, type `cmd`, and press Enter).*

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install all required Python dependencies (Flask, PyTorch, ML libraries, etc.)
pip install -r requirements.txt

# 4. Navigate to the backend folder and run the server
cd backend
python app.py
```
*The backend will load the PyTorch and Scikit-Learn models into memory and start on `http://localhost:5000`.*

### 3. Frontend Setup
Open a **new** terminal in the main project folder (leave the backend running in the first terminal):

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Vite development server
npm run dev
```
*The React application will compile and start on `http://localhost:5173`. Open this in your browser.*

---

## 🖥️ Installation Option 3: Terminal-Only (ML Inference Script)

If your client only wants to run the purely terminal-based Machine Learning script (without the web interface or Docker), they can use the `ml-for-agricultures-advisory` folder.

### 1. Environment Setup
*(Requires Python 3.12.6)*
Open a terminal in the main project folder and navigate to the ML sub-folder:
```bash
cd ml-for-agricultures-advisory

# Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install strictly the ML dependencies (no web packages required)
pip install -r requirements.txt
```

### 2. Run the Script
While still inside the `ml-for-agricultures-advisory` folder, execute the inference script:
```bash
python demo_inference.py
```
*The script will run in your terminal and print the ML predictions and analytics directly to the console.*

---

## 💻 Usage & Workflow

1. **Dashboard (`/dashboard`):** View aggregate analytics, active plots, and live weather telemetry.
2. **Data Input (`/input`):** Create a new farm plot. Use the **Map Picker** to search for your location, draw a polygon around your farm to calculate acreage, and click Save.
3. **Execution:** Click "Run Full Advisory Suite". The frontend dispatches the telemetry to the backend, which concurrently runs the ML models and generates SHAP explanations.
4. **Advisory (`/advisory`):** View your ML predictions and the top positive/negative feature impacts visually. 
5. **AI Deep Dive:** Click "Generate AI Deep Dive" to send the SHAP reasoning to the [Groq LLM](https://groq.com/). The AI will output a robust farming strategy. Click "Save to DB" to persist this report.

## 📁 Project Structure

```text
├── backend/                  # Flask API Server & Dockerfile
│   ├── app.py                # Main application routes & ML integration
│   ├── database.py           # Mongita DB connection layer
│   └── .mongita/             # Local database storage (Created automatically)
├── frontend/                 # React Application & Dockerfile
│   ├── src/                  # React Components & Pages
│   └── package.json          # Node dependencies
├── ml/                       # Machine Learning Code & Models
│   ├── models/               # Pre-trained .pkl and .pth models
│   └── src/                  # Model training and XAI scripts
├── docker-compose.yml        # Orchestration file
└── requirements.txt          # Python dependencies
```

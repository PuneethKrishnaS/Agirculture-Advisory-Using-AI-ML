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

## 🚀 Getting Started (Docker - Recommended)

The easiest way to run this application is via Docker, which completely handles all dependencies (Python, Node, Databases) for you.

### Prerequisites
- **Docker Desktop** installed on your machine.

### 1. Start the Application
Open a terminal in the root directory and run:
```bash
docker-compose up --build -d
```
*(This may take a few minutes the first time as it downloads the base images and ML dependencies).*

### 2. Access the Application
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Status:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 3. Add API Keys
To use the AI Deep Dive feature, add your Groq API key to the `docker-compose.yml` file:
```yaml
    environment:
      - PORT=5000
      - GROQ_API_KEY=your_groq_key_here
```
Then restart the container (`docker-compose up -d`).

---

## 💻 Usage & Workflow

1. **Dashboard (`/dashboard`):** View aggregate analytics, active plots, and live weather telemetry.
2. **Data Input (`/input`):** Create a new farm plot. Use the **Map Picker** to search for your location, draw a polygon around your farm to calculate acreage, and click Save.
3. **Execution:** Click "Run Full Advisory Suite". The frontend dispatches the telemetry to the backend, which concurrently runs the ML models and generates SHAP explanations.
4. **Advisory (`/advisory`):** View your ML predictions and the top positive/negative feature impacts visually. 
5. **AI Deep Dive:** Click "Generate AI Deep Dive" to send the SHAP reasoning to the Groq LLM. The AI will output a robust farming strategy. Click "Save to DB" to persist this report.

## 📁 Project Structure

```
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

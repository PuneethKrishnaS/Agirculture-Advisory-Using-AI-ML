# AgriSmart AI Labs - Full Stack Application

AgriSmart AI Labs is a comprehensive agricultural platform that combines a modern React frontend, a Flask/Python backend, and a suite of Machine Learning models to provide intelligent crop, fertilizer, and irrigation recommendations.

This guide provides end-to-end instructions for setting up and running the full-stack application.

---

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v16 or higher) and **npm**
- **Python** (3.8 or higher)
- **Git** (optional, for version control)

---

## 1. Setting up the Backend & ML Environment

The backend handles the API requests from the frontend and communicates with the underlying Machine Learning models.

### Step 1: Create a Virtual Environment
It is highly recommended to use a Python virtual environment to manage dependencies.
Open your terminal in the root folder (`Crop Predition`) and run:
```powershell
python -m venv venv
```

### Step 2: Activate the Virtual Environment
**Windows:**
```powershell
.\venv\Scripts\activate
```
**Mac/Linux:**
```bash
source venv/bin/activate
```

### Step 3: Install Python Dependencies
With the virtual environment active, install the required packages.
```powershell
pip install flask flask-cors pandas numpy scikit-learn xgboost lightgbm catboost joblib shap mongita
```
*(Note: If a `requirements.txt` file exists in the `backend` folder, you can run `pip install -r backend/requirements.txt` instead).*

### Step 4: Run the Backend Server
Navigate to the backend directory and start the Flask server:
```powershell
cd backend
python app.py
```
The backend server will start running on `http://localhost:5000`. Leave this terminal window open.

---

## 2. Setting up the Frontend

The frontend is a modern React application built with Vite, Tailwind CSS v4, and Shadcn UI.

### Step 1: Open a New Terminal
Open a **new** terminal window (leave the backend running in the first one) and navigate to the frontend directory:
```powershell
cd frontend
```

### Step 2: Install Node Dependencies
Install all required npm packages:
```powershell
npm install
```

### Step 3: Run the Development Server
Start the Vite development server:
```powershell
npm run dev
```
The frontend will compile and typically run on `http://localhost:5173`. 
Open this URL in your web browser to access the AgriSmart AI Labs dashboard.

---

## 3. End-to-End Workflow

Once both the backend and frontend servers are running:

1. **Dashboard (`/dashboard`):** View your overall farm analytics.
2. **Data Input (`/input`):** Enter telemetry data (Nitrogen, Phosphorus, Potassium, pH, etc.) or simulate data.
3. **Running Models:** When you click "Run Prediction" in the Data Input tab, the frontend sends a REST API request to the Python backend running on port 5000.
4. **Advisory (`/advisory`):** The backend processes the data using the ML models in the `ml/` directory, calculates SHAP explainability values, and returns the results to the frontend to be visualized in the Advisory dashboard.

---

## Troubleshooting

- **CORS Errors:** Ensure the backend is running on port 5000. The frontend makes requests to `http://localhost:5000/api/...`.
- **Python Module Not Found:** Ensure your virtual environment is activated BEFORE running `python app.py`.
- **Port Conflicts:** If port 5000 or 5173 is already in use, you may need to stop the conflicting service or configure the apps to use different ports (update the API base URL in `frontend/src/api` if you change the backend port).

For instructions on running just the Machine Learning models via terminal without the web interface, see [RUNNING_ML.md](RUNNING_ML.md).

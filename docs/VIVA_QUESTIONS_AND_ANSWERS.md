# 🎓 Project Viva & Presentation Guide (For Students)

This document contains a comprehensive list of questions that your lecturers, professors, or external examiners might ask you during your final project presentation or viva voce. 

Study these answers carefully to confidently defend your architecture, technology stack, and machine learning methodologies.

---

## 🏗️ 1. Architecture & Technology Stack

**Q1: Why did you choose React over plain HTML/JS or other frameworks?**
> **Answer:** React allows us to build a dynamic, Single Page Application (SPA) with highly reusable components. Because our dashboard has multiple complex visual states (like maps, loading skeletons, and interactive charts), React's Virtual DOM ensures the UI updates efficiently without reloading the page. We used Vite as our build tool because it offers significantly faster Hot Module Replacement (HMR) during development compared to traditional Webpack (Create React App).

**Q2: Why use Flask instead of Django or Node.js for the backend?**
> **Answer:** Our project relies heavily on Machine Learning (Scikit-learn, PyTorch, XGBoost). Python is the industry standard for ML. We chose Flask over Django because Flask is a lightweight micro-framework. We only needed to build a stateless REST API to serve predictions between the ML models and the React frontend, so Django's heavy built-in features (like its monolithic ORM) would have added unnecessary overhead.

**Q3: What is Mongita, and why didn't you use a real MongoDB server or SQL database?**
> **Answer:** Mongita is a lightweight, embedded NoSQL database that works exactly like MongoDB, but stores data locally in a `.mongita` folder (similar to how SQLite works for SQL). We chose this NoSQL document-based structure because our AI reports and SHAP telemetry are highly unstructured JSON data. We didn't use a full MongoDB server because we wanted the project to be easily portable and containerized for clients without requiring them to set up a heavy external database server.

**Q4: Why did you Dockerize the application?**
> **Answer:** Machine Learning projects suffer from the "it works on my machine" problem due to strict version dependencies (like specific CUDA drivers, Python versions, or C++ bindings for PyTorch). By using Docker, we containerize the exact Linux environment, Python 3.12 layer, and Node.js versions required. This guarantees the application will run flawlessly on any examiner's or client's computer without version conflicts.

---

## 🤖 2. Machine Learning & Explainable AI (XAI)

**Q5: What Machine Learning algorithms did you use for the Crop, Fertilizer, and Irrigation predictions?**
> **Answer:** We used an ensemble of models, primarily utilizing **XGBoost (Extreme Gradient Boosting)** and **Random Forest Classifiers**. These tree-based models perform exceptionally well on tabular datasets with non-linear relationships (like soil NPK values, pH, and weather data) and are highly resistant to overfitting compared to standard decision trees. 

**Q6: How does the Plant Disease Detection model work?**
> **Answer:** The disease detection is powered by Computer Vision using **PyTorch**. Specifically, we utilize a **ResNet9** (Residual Network) architecture. ResNet solves the "vanishing gradient" problem in deep neural networks by using skip-connections, allowing us to train a deep Convolutional Neural Network (CNN) that accurately extracts features (like leaf spots or discoloration) from uploaded farm images.

**Q7: Your project mentions "Explainable AI (XAI)" and SHAP. What is that and why is it important?**
> **Answer:** Machine Learning models are traditionally "black boxes" — they give a prediction, but don't tell you *why*. **SHAP (Shapley Additive exPlanations)** is a game-theoretic approach that calculates exactly how much each input feature (e.g., Rainfall, Nitrogen) contributed to the final prediction. This is critical in agriculture because farmers need to trust the AI. Instead of just saying "Plant Rice", SHAP allows our app to visually explain, "I recommend Rice because your Nitrogen is at 80 and Rainfall is 200mm."

---

## 🧠 3. Generative AI & LLM Integration

**Q8: How does the "AI Deep Dive" / Generative AI feature work?**
> **Answer:** While our Machine Learning models predict *what* to do, the Generative AI explains *how* to do it. We take the raw telemetry data and the SHAP values (the ML's mathematical reasoning) and inject them into a dynamic prompt. We send this prompt via API to a Large Language Model (LLM) powered by **Groq** (specifically running Llama 3). 

**Q9: Why use Groq instead of OpenAI (ChatGPT)?**
> **Answer:** Groq uses specialized hardware called LPUs (Language Processing Units) rather than traditional GPUs. This allows it to generate tokens at blistering speeds (often over 800 tokens per second). Because our users are waiting for a comprehensive, multi-page farming strategy on the frontend, Groq ensures the UI doesn't hang and the report is generated almost instantly.

---

## 📊 4. Data Flow & Integrations

**Q10: Explain the complete flow of data when a user clicks "Run Full Advisory Suite".**
> **Answer:** 
> 1. The React frontend collects the user's NPK, pH, and weather telemetry and sends a `POST` request to the Flask API.
> 2. Flask concurrently loads the pre-trained `.pkl` models using `joblib` and feeds the telemetry into them.
> 3. The models generate the predictions, and the SHAP explainer generates the feature impact arrays.
> 4. Flask packages these predictions into a JSON response and sends it back to React.
> 5. React updates the state, and the Recharts library renders the SHAP values dynamically on the screen.
> 6. If the user requests a Deep Dive, React calls another Flask endpoint which constructs the LLM prompt and queries the Groq API, finally saving the entire result to the Mongita database.

**Q11: How does the Interactive Map feature work?**
> **Answer:** The map uses the `react-leaflet` library built on top of Leaflet.js. We pull high-resolution satellite map tiles directly from Google Maps' tile servers (`mt1.google.com`). For the polygon drawing, we use a tool called `leaflet-draw`. When the user draws a polygon around their farm, the frontend uses a geometry library to calculate the exact acreage based on the GPS coordinates, which is then fed into our economic yield predictions.

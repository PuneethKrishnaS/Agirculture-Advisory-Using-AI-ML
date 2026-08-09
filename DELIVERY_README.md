# Crop Prediction AI Tool - Local Setup

Welcome! This package contains the fully containerized application for the **AgriSmart AI Labs** Crop Prediction Tool. You can run this software locally on your own machine without having to install complicated dependencies like Python or Node.js.

## Prerequisites
1. **Docker Desktop**: You must have Docker Desktop installed and running on your machine.
   - [Download Docker Desktop Here](https://www.docker.com/products/docker-desktop/)

## How to Run

1. **Extract this folder** to a location on your computer.
2. Ensure Docker Desktop is open and running in the background.
3. Open your terminal or command prompt in this folder (where this README is located).
4. Run the following command:
   ```bash
   docker-compose up --build -d
   ```
   *(Note: The first time you run this, it may take several minutes to download the base images and ML dependencies, depending on your internet connection).*

## Accessing the App
Once the terminal finishes building and says `Started`, you can access the tools directly in your web browser:

- **Frontend Application (Dashboard):** [http://localhost:3000](http://localhost:3000)
- **Backend API Status (Health Check):** [http://localhost:5000/api/health](http://localhost:5000/api/health)

## Stopping the App
To stop the application, open your terminal in this folder and run:
```bash
docker-compose down
```

## Data Persistence
Your farm plots, history, mapped polygon points, and user accounts are saved automatically into Docker volumes. This means that if you restart your computer or stop the Docker container, you will not lose your saved data (it is safely stored in the local `.mongita` database).

## Advanced: Generative AI Deep Dive Setup
To use the "AI Deep Dive" feature which generates human-readable farming strategies, you must provide a free Groq API key:

1. Create a free account and get an API Key at [console.groq.com](https://console.groq.com).
2. Open the `docker-compose.yml` file in a text editor.
3. Add your API key under the `backend` environment variables like this:
```yaml
    environment:
      - PORT=5000
      - GROQ_API_KEY=your_key_here
```
4. Restart the app with `docker-compose up -d`.

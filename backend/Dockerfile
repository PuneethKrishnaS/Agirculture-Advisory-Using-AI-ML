FROM python:3.12-slim

WORKDIR /app

# Install system dependencies if required for ML or DB
RUN apt-get update && apt-get install -y libgomp1 && rm -rf /var/lib/apt/lists/*

# Copy backend requirements (it is in the root directory)
COPY requirements.txt .
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt

# Copy ML folder (since backend relies on it)
COPY ml/ ./ml/

# Copy Backend folder
COPY backend/ ./backend/

WORKDIR /app/backend

# Expose port 5000
EXPOSE 5000

# Run the app
CMD ["python", "app.py"]

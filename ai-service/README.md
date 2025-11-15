# AI Fraud Detection Service

FastAPI service for fraud detection using machine learning.

## Installation

### Option 1: Standard Installation
```bash
pip install -r requirements.txt
```

### Option 2: With Increased Timeout (if network is slow)
```bash
pip install --default-timeout=100 -r requirements.txt
```

### Option 3: Install Core Dependencies Only
If you're having network issues, you can install just the essentials:
```bash
pip install fastapi uvicorn pydantic
```

The service will work but ML features will be limited.

## Running the Service

### Windows
```bash
python -m uvicorn fraud_detection.api:app --host 0.0.0.0 --port 5000
```

Or use the batch file:
```bash
start.bat
```

### Linux/Mac
```bash
python -m uvicorn fraud_detection.api:app --host 0.0.0.0 --port 5000
```

Or use the shell script:
```bash
chmod +x start.sh
./start.sh
```

## API Endpoints

- `GET /` - Health check
- `GET /health` - Service health status
- `POST /api/fraud-detection/check-anomaly` - Check user for anomalies
- `POST /api/fraud-detection/validate-credential` - Validate credential
- `POST /api/fraud-detection/analyze-career` - Analyze career progression

## Troubleshooting

### ModuleNotFoundError
Make sure you're running from the `ai-service` directory:
```bash
cd ai-service
python -m uvicorn fraud_detection.api:app --host 0.0.0.0 --port 5000
```

### Network Timeout During Installation
- Try increasing timeout: `pip install --default-timeout=100 -r requirements.txt`
- Or install packages one by one
- Or use a different pip mirror

### Port Already in Use
Change the port:
```bash
python -m uvicorn fraud_detection.api:app --host 0.0.0.0 --port 5001
```

Then update `backend/.env`:
```
FRAUD_DETECTION_SERVICE_URL=http://localhost:5001
```


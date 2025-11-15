@echo off
REM Start script for AI Fraud Detection Service (Windows)

cd /d "%~dp0"
python -m uvicorn fraud_detection.api:app --host 0.0.0.0 --port 5000 --reload


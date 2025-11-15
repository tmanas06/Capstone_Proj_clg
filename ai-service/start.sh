#!/bin/bash
# Start script for AI Fraud Detection Service

cd "$(dirname "$0")"
python -m uvicorn fraud_detection.api:app --host 0.0.0.0 --port 5000 --reload


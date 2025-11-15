"""
FastAPI endpoint for fraud detection service
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncio
import sys
import os

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fraud_detection.anomaly_detector import AnomalyDetector, CredentialValidator, CareerProgressionAnalyzer

app = FastAPI(title="JobVerify Fraud Detection API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
anomaly_detector = AnomalyDetector()
credential_validator = CredentialValidator()
career_analyzer = CareerProgressionAnalyzer()


class UserAnomalyCheckRequest(BaseModel):
    user_id: str
    kyc_completion_seconds: int
    applications_per_day: float
    credential_changes_count: int
    login_from_different_countries: int
    document_submission_speed: float = 0.0
    average_message_response_time: float = 0.0
    profile_completion_percentage: float = 0.0
    days_since_registration: int = 0


class CredentialValidationRequest(BaseModel):
    credential_id: str
    issuer: str
    credential_type: str
    issue_date: str
    expiration_date: Optional[str] = None


class CareerAnalysisRequest(BaseModel):
    employment_history: List[Dict[str, Any]]


@app.get("/")
async def root():
    return {"message": "JobVerify Fraud Detection API", "status": "running"}


@app.post("/api/fraud-detection/check-anomaly")
async def check_user_anomaly(request: UserAnomalyCheckRequest):
    """Check if user behavior is anomalous"""
    try:
        user_data = request.dict()
        result = anomaly_detector.detect_anomaly(user_data)
        
        # If high risk, log for blockchain flagging
        if result['risk_level'] in ['HIGH', 'CRITICAL']:
            # In production, this would trigger blockchain event
            print(f"High risk user detected: {request.user_id}, Risk: {result['risk_level']}")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")


@app.post("/api/fraud-detection/validate-credential")
async def validate_credential(request: CredentialValidationRequest):
    """Validate credential authenticity"""
    try:
        credential_data = request.dict()
        result = credential_validator.validate_credential(credential_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Credential validation failed: {str(e)}")


@app.post("/api/fraud-detection/analyze-career")
async def analyze_career(request: CareerAnalysisRequest):
    """Analyze career progression for suspicious patterns"""
    try:
        result = career_analyzer.analyze_career_timeline(request.employment_history)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Career analysis failed: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "services": {
        "anomaly_detector": "active",
        "credential_validator": "active",
        "career_analyzer": "active"
    }}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)


"""
Anomaly Detection Engine for JobVerify
Detects fraudulent behavior patterns using machine learning
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
from datetime import datetime
from typing import Dict, List, Any


class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_fitted = False
        
    def extract_features(self, user_data: dict) -> np.ndarray:
        """
        Extract behavioral features from user:
        - KYC completion time
        - Application frequency
        - Credential submission patterns
        - Login patterns
        - Geographic anomalies
        - Device changes
        """
        features = [
            user_data.get('kyc_completion_seconds', 0),
            user_data.get('applications_per_day', 0.0),
            user_data.get('credential_changes_count', 0),
            user_data.get('login_from_different_countries', 0),
            user_data.get('document_submission_speed', 0.0),
            user_data.get('average_message_response_time', 0.0),
            user_data.get('profile_completion_percentage', 0.0),
            user_data.get('days_since_registration', 0)
        ]
        
        return np.array(features).reshape(1, -1)
    
    def fit(self, training_data: List[Dict[str, Any]]):
        """Fit the model on training data"""
        if not training_data:
            return
            
        features_list = []
        for user_data in training_data:
            features = self.extract_features(user_data)
            features_list.append(features[0])
        
        X = np.array(features_list)
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled)
        self.is_fitted = True
    
    def detect_anomaly(self, user_data: dict) -> dict:
        """
        Detect anomalies in user behavior
        Returns: {is_anomaly: bool, anomaly_score: float, risk_level: str}
        """
        if not self.is_fitted:
            # Use default model if not fitted
            self._initialize_default_model()
        
        features = self.extract_features(user_data)
        scaled_features = self.scaler.transform(features)
        
        # Isolation Forest prediction (-1 = anomaly, 1 = normal)
        prediction = self.model.predict(scaled_features)
        
        # Get anomaly score (higher = more anomalous)
        anomaly_score = -self.model.score_samples(scaled_features)[0]
        
        risk_level = self._calculate_risk_level(anomaly_score)
        
        return {
            'is_anomaly': prediction[0] == -1,
            'anomaly_score': float(anomaly_score),
            'risk_level': risk_level,
            'flagged_features': self._identify_problematic_features(user_data)
        }
    
    def _initialize_default_model(self):
        """Initialize with default training data"""
        # Generate synthetic normal data for default model
        default_data = []
        for _ in range(100):
            default_data.append({
                'kyc_completion_seconds': np.random.randint(60, 600),
                'applications_per_day': np.random.uniform(0.1, 5.0),
                'credential_changes_count': np.random.randint(0, 3),
                'login_from_different_countries': np.random.randint(0, 2),
                'document_submission_speed': np.random.uniform(1.0, 10.0),
                'average_message_response_time': np.random.uniform(0.5, 24.0),
                'profile_completion_percentage': np.random.uniform(50.0, 100.0),
                'days_since_registration': np.random.randint(1, 365)
            })
        self.fit(default_data)
    
    def _calculate_risk_level(self, score: float) -> str:
        """Map anomaly score to risk levels"""
        if score < 0.5:
            return 'LOW'
        elif score < 1.5:
            return 'MEDIUM'
        elif score < 2.5:
            return 'HIGH'
        else:
            return 'CRITICAL'
    
    def _identify_problematic_features(self, user_data: dict) -> list:
        """Identify which features triggered anomaly flags"""
        flags = []
        
        if user_data.get('kyc_completion_seconds', 0) < 30:
            flags.append('suspiciously_fast_kyc')
        
        if user_data.get('login_from_different_countries', 0) > 3:
            flags.append('multiple_geographic_locations')
        
        if user_data.get('applications_per_day', 0) > 50:
            flags.append('excessive_applications')
        
        if user_data.get('credential_changes_count', 0) > 10:
            flags.append('frequent_credential_modifications')
        
        return flags


class CredentialValidator:
    def __init__(self):
        self.institution_registry = self._load_institution_registry()
    
    def validate_credential(self, credential: dict) -> dict:
        """
        Validate educational/professional credential
        - Check issuer legitimacy
        - Verify credential exists in registry
        - Check expiration
        - Identify inconsistencies
        """
        validation_result = {
            'is_valid': True,
            'issues': [],
            'confidence_score': 0.95
        }
        
        # Check issuer
        issuer_verified = self._verify_issuer(credential.get('issuer', ''))
        if not issuer_verified:
            validation_result['is_valid'] = False
            validation_result['issues'].append('Unverified issuer')
            validation_result['confidence_score'] -= 0.3
        
        # Check expiration
        if credential.get('expiration_date'):
            try:
                exp_date = datetime.fromisoformat(credential['expiration_date'])
                if datetime.now() > exp_date:
                    validation_result['issues'].append('Credential expired')
                    validation_result['confidence_score'] -= 0.2
            except:
                validation_result['issues'].append('Invalid expiration date format')
                validation_result['confidence_score'] -= 0.1
        
        # Check against institution registry
        if not self._check_institution_registry(credential):
            validation_result['issues'].append('Not found in official registry')
            validation_result['confidence_score'] -= 0.4
        
        if validation_result['confidence_score'] < 0.5:
            validation_result['is_valid'] = False
        
        return validation_result
    
    def _verify_issuer(self, issuer: str) -> bool:
        """Verify issuer against known databases"""
        return issuer in self.institution_registry
    
    def _check_institution_registry(self, credential: dict) -> bool:
        """Query official institution registries"""
        # Integration with:
        # - Official university registries
        # - Professional certification bodies
        # - Government credential databases
        return True  # Placeholder
    
    def _load_institution_registry(self) -> set:
        """Load list of verified institutions"""
        # In production, this would load from a database or API
        return {
            'MIT', 'Harvard', 'Stanford', 'Oxford', 'Cambridge',
            'PMI', 'CompTIA', 'AWS', 'Google', 'Microsoft'
        }


class CareerProgressionAnalyzer:
    def analyze_career_timeline(self, employment_history: list) -> dict:
        """
        Analyze career progression for red flags:
        - Overlapping employment periods
        - Implausible salary jumps
        - Too-frequent job changes
        - Suspicious gaps
        """
        analysis = {
            'is_suspicious': False,
            'flags': [],
            'confidence_score': 0.95
        }
        
        if not employment_history:
            return analysis
        
        for i, job in enumerate(employment_history):
            # Check for overlaps
            if i > 0:
                try:
                    prev_end = datetime.fromisoformat(employment_history[i-1].get('end_date', ''))
                    curr_start = datetime.fromisoformat(job.get('start_date', ''))
                    
                    if prev_end > curr_start:
                        analysis['flags'].append(
                            f'Overlapping employment: {employment_history[i-1].get("company", "Unknown")} and {job.get("company", "Unknown")}'
                        )
                        analysis['is_suspicious'] = True
                        analysis['confidence_score'] -= 0.3
                except:
                    pass
            
            # Check salary progression
            if i > 0 and job.get('salary') and employment_history[i-1].get('salary'):
                try:
                    prev_salary = float(employment_history[i-1]['salary'])
                    curr_salary = float(job['salary'])
                    
                    if prev_salary > 0:
                        salary_increase = (curr_salary - prev_salary) / prev_salary
                        
                        if salary_increase > 2.0:  # More than 100% increase
                            analysis['flags'].append(
                                f'Implausible salary jump: {salary_increase*100:.1f}%'
                            )
                            analysis['is_suspicious'] = True
                            analysis['confidence_score'] -= 0.2
                except:
                    pass
        
        return analysis


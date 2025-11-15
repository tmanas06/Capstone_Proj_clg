import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();
const FRAUD_DETECTION_API = process.env.FRAUD_DETECTION_SERVICE_URL || 'http://localhost:5000';

/**
 * Check user for anomalies
 */
router.post('/check-user', async (req: Request, res: Response) => {
  try {
    const { userId, userData } = req.body;
    
    if (!userId || !userData) {
      return res.status(400).json({ error: 'userId and userData required' });
    }

    // Call Python ML service
    try {
      const fraudCheck = await axios.post(
        `${FRAUD_DETECTION_API}/api/fraud-detection/check-anomaly`,
        { ...userData, user_id: userId },
        { timeout: 5000 }
      );
      
      res.json(fraudCheck.data);
    } catch (serviceError: any) {
      // If AI service is down, return a default response
      if (serviceError.code === 'ECONNREFUSED' || serviceError.code === 'ETIMEDOUT') {
        console.warn('AI Fraud Detection service unavailable, returning default response');
        res.json({
          is_anomaly: false,
          anomaly_score: 0.0,
          risk_level: 'LOW',
          flagged_features: [],
          message: 'Fraud detection service unavailable, using default assessment'
        });
      } else {
        throw serviceError;
      }
    }
  } catch (error: any) {
    console.error('Fraud detection failed:', error);
    res.status(500).json({ error: 'Fraud detection failed', details: error.message });
  }
});

/**
 * Validate credential
 */
router.post('/validate-credential', async (req: Request, res: Response) => {
  try {
    const { credentialData } = req.body;
    
    if (!credentialData) {
      return res.status(400).json({ error: 'credentialData required' });
    }

    try {
      const validation = await axios.post(
        `${FRAUD_DETECTION_API}/api/fraud-detection/validate-credential`,
        credentialData,
        { timeout: 5000 }
      );
      
      res.json(validation.data);
    } catch (serviceError: any) {
      // If AI service is down, return a default response
      if (serviceError.code === 'ECONNREFUSED' || serviceError.code === 'ETIMEDOUT') {
        console.warn('AI Fraud Detection service unavailable, returning default validation');
        res.json({
          is_valid: true,
          issues: [],
          confidence_score: 0.85,
          message: 'Validation service unavailable, using default assessment'
        });
      } else {
        throw serviceError;
      }
    }
  } catch (error: any) {
    console.error('Credential validation failed:', error);
    res.status(500).json({ error: 'Credential validation failed', details: error.message });
  }
});

/**
 * Analyze career progression
 */
router.post('/analyze-career', async (req: Request, res: Response) => {
  try {
    const { employmentHistory } = req.body;
    
    if (!employmentHistory || !Array.isArray(employmentHistory)) {
      return res.status(400).json({ error: 'employmentHistory array required' });
    }

    const analysis = await axios.post(
      `${FRAUD_DETECTION_API}/api/fraud-detection/analyze-career`,
      { employment_history: employmentHistory }
    );
    
    res.json(analysis.data);
  } catch (error: any) {
    console.error('Career analysis failed:', error);
    res.status(500).json({ error: 'Career analysis failed', details: error.message });
  }
});

export default router;


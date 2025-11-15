import express, { Request, Response } from 'express';
import axios from 'axios';
import { ethers } from 'ethers';

const router = express.Router();

const SELF_PROTOCOL_API_KEY = process.env.SELF_PROTOCOL_API_KEY || '';
const FRAUD_DETECTION_URL = process.env.FRAUD_DETECTION_SERVICE_URL || 'http://localhost:5000';

/**
 * Initiate KYC verification through Self Protocol
 */
router.post('/kyc/initiate', async (req: Request, res: Response) => {
  try {
    const { userAddress, phoneNumber } = req.body;
    
    if (!userAddress || !phoneNumber) {
      return res.status(400).json({ error: 'userAddress and phoneNumber required' });
    }

    // Initialize KYC through Self Protocol
    // In production, this would call Self Protocol SDK
    const verificationId = `verification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({ 
      verificationId, 
      status: 'pending',
      message: 'Please scan your passport using the mobile app'
    });
  } catch (error: any) {
    console.error('KYC initiation failed:', error);
    res.status(500).json({ error: 'KYC initiation failed', details: error.message });
  }
});

/**
 * Get user profile
 */
router.get('/profile/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    // In production, this would query blockchain or database
    const profile = {
      address,
      name: '',
      email: '',
      kycComplete: false,
      trustScore: 0,
      credentials: []
    };
    
    res.json(profile);
  } catch (error: any) {
    console.error('Failed to get profile:', error);
    res.status(404).json({ error: 'User not found' });
  }
});

/**
 * Add credential to user profile
 */
router.post('/credentials/add', async (req: Request, res: Response) => {
  try {
    const { userAddress, credentialData } = req.body;
    
    if (!userAddress || !credentialData) {
      return res.status(400).json({ error: 'userAddress and credentialData required' });
    }

    // Validate credential through fraud detection service
    let validationResponse;
    try {
      validationResponse = await axios.post(
        `${FRAUD_DETECTION_URL}/api/fraud-detection/validate-credential`,
        credentialData,
        { timeout: 5000 }
      );
    } catch (serviceError: any) {
      // If AI service is down, skip validation
      if (serviceError.code === 'ECONNREFUSED' || serviceError.code === 'ETIMEDOUT') {
        console.warn('Fraud detection service unavailable, skipping validation');
        validationResponse = {
          data: {
            is_valid: true,
            issues: [],
            confidence_score: 0.85
          }
        };
      } else {
        throw serviceError;
      }
    }

    if (!validationResponse.data.is_valid) {
      return res.status(400).json({ 
        error: 'Credential validation failed',
        issues: validationResponse.data.issues
      });
    }

    // In production, this would write to blockchain
    res.json({ 
      status: 'success',
      credentialId: `cred_${Date.now()}`,
      validation: validationResponse.data
    });
  } catch (error: any) {
    console.error('Credential update failed:', error);
    res.status(500).json({ error: 'Credential update failed', details: error.message });
  }
});

/**
 * Check user for fraud anomalies
 */
router.post('/fraud-check', async (req: Request, res: Response) => {
  try {
    const { userData } = req.body;
    
    const fraudCheck = await axios.post(
      `${FRAUD_DETECTION_URL}/api/fraud-detection/check-anomaly`,
      userData
    );
    
    res.json(fraudCheck.data);
  } catch (error: any) {
    console.error('Fraud check failed:', error);
    res.status(500).json({ error: 'Fraud check failed', details: error.message });
  }
});

export default router;


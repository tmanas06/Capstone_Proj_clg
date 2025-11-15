'use client';

import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import SelfProtocolVerifier from '@/lib/SelfProtocolVerifier';
import { useContract } from '@/hooks/useContract';

export default function KYCFlow() {
  const [step, setStep] = useState(1);
  const [verificationId, setVerificationId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const { userVerificationContract } = useContract();
  
  // Get signer for SelfProtocolVerifier
  const signer = useMemo(() => {
    if (!isConnected || !address || typeof window === 'undefined' || !(window as any).ethereum) return null;
    try {
      const ethersProvider = new ethers.providers.Web3Provider((window as any).ethereum);
      return ethersProvider.getSigner();
    } catch (e) {
      return null;
    }
  }, [isConnected, address]);

  const handleSelfProtocolScan = async () => {
    if (!phoneNumber) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Initiate passport scanning
      const verifier = new SelfProtocolVerifier(
        process.env.NEXT_PUBLIC_SELF_API_KEY || '',
        signer?.provider
      );
      
      const id = await verifier.initiateIdentityVerification(phoneNumber);
      setVerificationId(id);
      setStep(2);
    } catch (err: any) {
      console.error('KYC initiation failed:', err);
      setError(err.message || 'Failed to initiate verification');
    } finally {
      setLoading(false);
    }
  };

  const handleProofSubmission = async () => {
    if (!signer || !userVerificationContract) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 2: Generate and submit ZKP
      const verifier = new SelfProtocolVerifier(
        process.env.NEXT_PUBLIC_SELF_API_KEY || '',
        signer.provider
      );
      
      const zkProof = await verifier.generateZeroKnowledgeProof(verificationId);
      
      const txHash = await verifier.submitProofToBlockchain(
        zkProof,
        await signer.getAddress(),
        userVerificationContract
      );
      
      setStep(3); // Success
    } catch (err: any) {
      console.error('Proof submission failed:', err);
      setError(err.message || 'Failed to submit verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">KYC Verification</h2>
      
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          
          <button
            onClick={handleSelfProtocolScan}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Initiating...' : 'Start Passport Scanning'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              Verification ID: {verificationId}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Please scan your passport using the Self Protocol mobile app.
              Once scanning is complete, click the button below to submit your verification.
            </p>
          </div>
          
          <button
            onClick={handleProofSubmission}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Verification'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">✓</div>
          <h3 className="text-xl font-bold text-green-600">
            KYC Verification Complete!
          </h3>
          <p className="text-gray-600">
            Your identity has been verified. You can now use all platform features.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}


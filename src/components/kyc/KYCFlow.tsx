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
      
      {/* Process Explanation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
          📋 How the KYC Process Works
        </h3>
        <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <span><strong>Enter Phone Number:</strong> Provide your phone number to initiate the verification process. This is used to link your identity verification session.</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <span><strong>Passport Scanning:</strong> After entering your phone number, you'll receive instructions to scan your passport using the Self Protocol mobile app (not on this website).</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <span><strong>Zero-Knowledge Proof:</strong> Your identity is verified using zero-knowledge proofs, ensuring privacy while confirming your identity.</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">4.</span>
            <span><strong>Blockchain Verification:</strong> Once verified, your KYC status is recorded on the blockchain, allowing you to apply for jobs.</span>
          </li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> You only need to enter your <strong>phone number</strong> here. The passport scanning happens separately through the Self Protocol mobile app after you click "Start Verification".
          </p>
        </div>
      </div>

      {!isConnected && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ Wallet Not Connected:</strong> Please connect your wallet to proceed with KYC verification.
          </p>
        </div>
      )}
      
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              disabled={!isConnected || loading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter your phone number with country code (e.g., +1 for USA, +44 for UK)
            </p>
          </div>
          
          <button
            onClick={handleSelfProtocolScan}
            disabled={loading || !isConnected || !phoneNumber}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Initiating Verification...' : 'Start Verification Process'}
          </button>
          
          {!isConnected && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Please connect your wallet first
            </p>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
              📱 Next Steps: Passport Scanning
            </h3>
            <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
              <p>
                <strong>Verification ID:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">{verificationId}</code>
              </p>
              <div className="border-t border-blue-200 dark:border-blue-700 pt-3">
                <p className="font-semibold mb-2">What to do now:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Open the <strong>Self Protocol mobile app</strong> on your phone</li>
                  <li>Enter the Verification ID shown above</li>
                  <li>Follow the app instructions to <strong>scan your passport</strong> using your phone's camera</li>
                  <li>Wait for the app to process your passport scan</li>
                  <li>Once the app confirms scanning is complete, return here and click "Submit Verification" below</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>💡 Tip:</strong> Keep this page open while you scan your passport. You'll need to return here to complete the verification.
            </p>
          </div>
          
          <button
            onClick={handleProofSubmission}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Submitting Verification...' : 'Submit Verification to Blockchain'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4 text-green-600">✓</div>
          <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
            KYC Verification Complete!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your identity has been verified and recorded on the blockchain. You can now use all platform features.
          </p>
          <div className="mt-6 space-y-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">What you can do now:</p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>✓ Apply for jobs on the platform</li>
              <li>✓ Submit credentials for verification</li>
              <li>✓ Access all verified user features</li>
            </ul>
          </div>
          <div className="mt-6">
            <a
              href="/dashboard/job-search"
              className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 font-medium"
            >
              Browse Jobs
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
}


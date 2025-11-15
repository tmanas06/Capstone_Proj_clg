'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/useContract';
import { ethers } from 'ethers';

export default function JobPostings() {
  const { address } = useAccount();
  const { jobPostingContract, companyVerificationContract, signer, contractAddresses, contractABIs } = useContract();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredCredentials: [] as string[],
    minimumTrustScore: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    if (!jobPostingContract || !companyVerificationContract) {
      setError('Contracts not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verify company is registered and verified
      let companyInfo;
      try {
        companyInfo = await companyVerificationContract.getCompanyInfo(address);
      } catch (err: any) {
        if (err.message?.includes('Company not registered')) {
          setError('Your wallet is not registered as a company. Please register your company first using the "Register Company" button below.');
          return;
        }
        throw err;
      }
      
      if (!companyInfo.verified) {
        setError('Company must be verified before posting jobs. Please complete company verification first.');
        return;
      }

      // Create job posting on blockchain - need to use signer for write operations
      if (!signer || !contractAddresses || !contractABIs) {
        setError('Please switch your wallet to localhost network (chainId 31337) to post jobs');
        return;
      }

      const writeJobContract = new ethers.Contract(
        contractAddresses.jobPosting,
        contractABIs.jobPosting,
        signer
      );

      const tx = await writeJobContract.createJobPosting(
        formData.title,
        formData.description,
        [], // requiredCredentials (bytes32[])
        formData.minimumTrustScore
      );
      
      const receipt = await tx.wait();
      
      alert('Job posted successfully! Transaction: ' + receipt.transactionHash);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        requiredCredentials: [],
        minimumTrustScore: 50
      });
    } catch (err: any) {
      console.error('Job posting failed:', err);
      setError(err.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCompany = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    if (!signer || !contractAddresses || !contractABIs) {
      setError('Please switch your wallet to localhost network (chainId 31337) to register a company');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Register company with a simple hash
      const companyName = `Company-${address.slice(0, 8)}`;
      const companyHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(companyName));

      const writeContract = new ethers.Contract(
        contractAddresses.companyVerification,
        contractABIs.companyVerification,
        signer
      );

      const tx = await writeContract.registerCompany(
        companyHash,
        [address] // Single officer (themselves)
      );
      
      const receipt = await tx.wait();
      
      // Verify the officer (as deployer/admin)
      // Note: This requires admin/verifier role - for testing, we'll skip this step
      // In production, an admin would verify the company
      
      alert('Company registered! Note: Company verification by admin is required before posting jobs. For testing, you can use one of the seeded company accounts.');
      
    } catch (err: any) {
      console.error('Company registration failed:', err);
      if (err.message?.includes('chainId') || err.message?.includes('network')) {
        setError('Please switch your wallet to localhost network (chainId 31337). Click the network dropdown in your wallet and select "Localhost 8545"');
      } else {
        setError(err.message || 'Failed to register company');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Post a Job</h1>
      
      {/* Network Warning */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          <strong>⚠️ Network Mismatch:</strong> Your wallet is on mainnet (chainId 1), but contracts are on localhost (31337). 
          Please switch your wallet to localhost network to post jobs. In MetaMask: Settings → Networks → Add Network → 
          Network Name: "Localhost 8545", RPC URL: "http://127.0.0.1:8545", Chain ID: "31337"
        </p>
      </div>

      {/* Company Registration Section */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Company Registration</h2>
        <p className="text-sm text-gray-700 mb-3">
          Your wallet address is not registered as a company. You need to register first before posting jobs.
        </p>
        <button
          type="button"
          onClick={handleRegisterCompany}
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          Register My Company
        </button>
        <p className="text-xs text-gray-600 mt-2">
          <strong>Note:</strong> For testing, you can use one of the seeded company accounts: 
          <code className="ml-1 px-1 bg-gray-100 rounded">0x90F79bf6EB2c4f870365E785982E1f101E93b906</code> or 
          <code className="ml-1 px-1 bg-gray-100 rounded">0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65</code>
        </p>
      </div>
      
      <form onSubmit={handlePostJob} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Job Title *
          </label>
          <input
            type="text"
            placeholder="e.g., Senior Blockchain Developer"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Job Description *
          </label>
          <textarea
            placeholder="Describe the job requirements, responsibilities, etc."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            rows={6}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Minimum Trust Score
          </label>
          <input
            type="number"
            placeholder="50"
            value={formData.minimumTrustScore}
            onChange={(e) => setFormData({...formData, minimumTrustScore: parseInt(e.target.value) || 0})}
            min="0"
            max="100"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-sm text-gray-500 mt-1">
            Minimum trust score required for candidates (0-100)
          </p>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}


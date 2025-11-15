'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/useContract';

export default function CompanyTrustScore() {
  const { address } = useAccount();
  const { companyVerificationContract } = useContract();
  
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address && companyVerificationContract) {
      fetchCompanyInfo();
    }
  }, [address, companyVerificationContract]);

  const fetchCompanyInfo = async () => {
    if (!address || !companyVerificationContract) return;

    setLoading(true);
    try {
      const info = await companyVerificationContract.getCompanyInfo(address);
      const score = await companyVerificationContract.getCompanyTrustScore(address);
      
      setCompanyInfo(info);
      setTrustScore(Number(score));
    } catch (error) {
      console.error('Failed to fetch company info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (!companyInfo) {
    return (
      <div className="container mx-auto py-8">
        <p>Company not registered. Please register your company first.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Company Trust Score</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(trustScore || 0)}`}>
            {trustScore || 0}
          </div>
          <div className="text-xl text-gray-600 dark:text-gray-400">
            {getScoreLabel(trustScore || 0)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Job Postings</div>
            <div className="text-2xl font-bold">{Number(companyInfo.jobPostingsCount)}</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Successful Hires</div>
            <div className="text-2xl font-bold">{Number(companyInfo.hiresCount)}</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Complaints</div>
            <div className="text-2xl font-bold">{Number(companyInfo.complaintsCount)}</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Verified Officers</div>
            <div className="text-2xl font-bold">{Number(companyInfo.officerCount)}</div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => companyVerificationContract?.calculateTrustScore(address)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Recalculate Trust Score
          </button>
        </div>
      </div>
    </div>
  );
}


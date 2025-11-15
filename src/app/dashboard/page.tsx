'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/useContract';
import Link from 'next/link';

interface Job {
  jobId: string;
  title: string;
  company: string;
  minTrustScore: number;
  status: string;
}

interface User {
  address: string;
  kycComplete: boolean;
  credentialCount: number;
}

interface Company {
  address: string;
  verified: boolean;
  trustScore: number;
  jobCount: number;
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { 
    userVerificationContract, 
    companyVerificationContract, 
    jobPostingContract,
    credentialRegistryContract,
    loading 
  } = useContract();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalUsers: 0,
    totalCompanies: 0,
    totalCredentials: 0,
  });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // Fetch data if contract is available (doesn't require wallet connection for reads)
    if (jobPostingContract) {
      fetchDashboardData();
    } else {
      console.log('Waiting for contract to initialize...');
    }
  }, [jobPostingContract]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      console.log('📊 Fetching dashboard data...');
      console.log('JobPosting contract:', jobPostingContract ? 'exists' : 'null');
      
      if (jobPostingContract) {
        console.log('Contract address:', jobPostingContract.address);
        console.log('Provider URL:', (jobPostingContract.provider as any)?.connection?.url || 'localhost');
      }
      
      // Fetch total jobs
      if (jobPostingContract) {
        try {
          // First verify contract exists by checking code
          console.log('🔍 Verifying contract exists...');
          const code = await jobPostingContract.provider.getCode(jobPostingContract.address);
          console.log('Contract code exists:', code !== '0x' ? '✅ YES' : '❌ NO');
          
          if (code === '0x') {
            const errorMsg = 'Contract does not exist at this address. Hardhat node may have been restarted. Please redeploy contracts.';
            console.error('❌', errorMsg);
            throw new Error(errorMsg);
          }
          
          console.log('✅ Contract verified, calling getTotalJobs()...');
          const totalJobs = await jobPostingContract.getTotalJobs();
          console.log('Total jobs:', totalJobs.toString());
          setStats(prev => ({ ...prev, totalJobs: totalJobs.toNumber() }));

          // Fetch actual job data from blockchain
          const jobsData: Job[] = [];
          const maxJobs = Math.min(totalJobs.toNumber(), 10); // Try up to 10 jobs
          
          console.log(`Fetching ${maxJobs} jobs...`);
          for (let i = 1; i <= maxJobs; i++) {
            try {
              console.log(`Fetching job ${i}...`);
              
              // Use getJobDetails() if available, otherwise fall back to jobs()
              let jobDetails: any;
              try {
                jobDetails = await jobPostingContract.getJobDetails(i);
              } catch (e: any) {
                // Fall back to jobs() if getJobDetails doesn't exist
                if (e.message?.includes('getJobDetails') || e.message?.includes('not found')) {
                  const job = await jobPostingContract.jobs(i);
                  jobDetails = {
                    companyAddress: job.companyAddress,
                    positionTitle: job.positionTitle,
                    description: job.description,
                    requiredCredentials: job.requiredCredentials || [],
                    minimumTrustScore: job.minimumTrustScore
                  };
                } else {
                  throw e;
                }
              }
              
              // Extract fields
              const companyAddress = jobDetails.companyAddress || jobDetails[0];
              const positionTitle = jobDetails.positionTitle || jobDetails[1];
              const minimumTrustScore = jobDetails.minimumTrustScore || jobDetails[4];
              
              // Check if job exists
              if (companyAddress && companyAddress !== '0x0000000000000000000000000000000000000000') {
                // Convert minimumTrustScore safely
                let minTrustScore = 0;
                try {
                  if (minimumTrustScore !== undefined && minimumTrustScore !== null) {
                    if (typeof minimumTrustScore === 'object' && 'toNumber' in minimumTrustScore) {
                      minTrustScore = minimumTrustScore.toNumber();
                    } else if (typeof minimumTrustScore === 'number') {
                      minTrustScore = minimumTrustScore;
                    } else {
                      const parsed = parseInt(String(minimumTrustScore), 10);
                      if (!isNaN(parsed)) {
                        minTrustScore = parsed;
                      }
                    }
                  }
                } catch (e: any) {
                  console.warn(`Could not convert minTrustScore for job ${i}:`, e.message);
                  minTrustScore = 0;
                }

                jobsData.push({
                  jobId: i.toString(),
                  title: positionTitle || `Job #${i}`,
                  company: companyAddress,
                  minTrustScore: minTrustScore,
                  status: 'Active', // Default status since getJobDetails doesn't return it
                });
                console.log(`Job ${i} added:`, positionTitle || `Job #${i}`);
              } else {
                console.log(`Job ${i} has invalid company address`);
              }
            } catch (e: any) {
              // Handle errors
              if (e.code === 'NUMERIC_FAULT' && e.fault === 'overflow') {
                console.warn(`⚠️ Job ${i}: Overflow - contract needs getJobDetails() function`);
                // Skip this job
              } else {
                console.log(`Job ${i} not found:`, e.message);
                // If we get a revert, likely no more jobs
                if (e.message?.includes('revert') || e.code === 'CALL_EXCEPTION') {
                  break;
                }
              }
            }
          }
          console.log(`Found ${jobsData.length} jobs`);
          setJobs(jobsData);
        } catch (e: any) {
          console.error('Error fetching jobs:', e);
          console.error('Error details:', {
            message: e.message,
            code: e.code,
            data: e.data,
            contractAddress: jobPostingContract?.address
          });
          
          // Fallback: Try to fetch jobs manually without getTotalJobs()
          console.log('Attempting fallback: fetching jobs manually (1-10)...');
          try {
            const jobsData: Job[] = [];
            for (let i = 1; i <= 10; i++) {
              try {
                const job = await jobPostingContract.jobs(i);
                if (job && job.companyAddress && job.companyAddress !== '0x0000000000000000000000000000000000000000') {
                  jobsData.push({
                    jobId: i.toString(),
                    title: job.positionTitle || `Job #${i}`,
                    company: job.companyAddress,
                    minTrustScore: job.minimumTrustScore || 0,
                    status: job.status === 0 ? 'Active' : job.status === 1 ? 'Closed' : job.status === 2 ? 'Filled' : 'Cancelled',
                  });
                }
              } catch (jobError: any) {
                // No more jobs
                if (jobError.message?.includes('revert') || jobError.code === 'CALL_EXCEPTION') {
                  break;
                }
              }
            }
            if (jobsData.length > 0) {
              console.log(`Fallback successful: Found ${jobsData.length} jobs`);
              setJobs(jobsData);
              setStats(prev => ({ ...prev, totalJobs: jobsData.length }));
            } else {
              setStats(prev => ({ ...prev, totalJobs: 0 }));
            }
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            setStats(prev => ({ ...prev, totalJobs: 0 }));
          }
        }
      } else {
        console.error('JobPosting contract is null!');
      }

      // Fetch user verification status
      if (address && userVerificationContract) {
        try {
          const status = await userVerificationContract.getVerificationStatus(address);
          const creds = await credentialRegistryContract?.getCandidateCredentials(address) || [];
          setUsers([{
            address: address,
            kycComplete: status.kycComplete,
            credentialCount: creds.length || 0,
          }]);
        } catch (e) {
          console.log('User not verified yet');
        }
      }

      // Fetch company info if address is a company
      if (address && companyVerificationContract) {
        try {
          const companyInfo = await companyVerificationContract.getCompanyInfo(address);
          const activeJobs = await jobPostingContract?.getCompanyActiveJobs(address) || [];
          setCompanies([{
            address: address,
            verified: companyInfo.verified,
            trustScore: companyInfo.trustScore.toNumber(),
            jobCount: activeJobs.length || 0,
          }]);
        } catch (e) {
          // Not a company
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please connect your wallet to view your dashboard
        </p>
        <Link 
          href="/auth/kyc-verification"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Jobs</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalJobs}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalUsers || users.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Companies</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalCompanies || companies.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Credentials</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalCredentials}</p>
        </div>
      </div>

      {/* User Info */}
      {users.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Your Profile</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Address:</span> {users[0].address}</p>
            <p>
              <span className="font-medium">KYC Status:</span>{' '}
              <span className={users[0].kycComplete ? 'text-green-600' : 'text-yellow-600'}>
                {users[0].kycComplete ? '✓ Verified' : 'Pending'}
              </span>
            </p>
            <p><span className="font-medium">Credentials:</span> {users[0].credentialCount}</p>
            {!users[0].kycComplete && (
              <Link 
                href="/auth/kyc-verification"
                className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Complete KYC
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Company Info */}
      {companies.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Your Company</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Address:</span> {companies[0].address}</p>
            <p>
              <span className="font-medium">Verified:</span>{' '}
              <span className={companies[0].verified ? 'text-green-600' : 'text-yellow-600'}>
                {companies[0].verified ? '✓ Yes' : 'No'}
              </span>
            </p>
            <p><span className="font-medium">Trust Score:</span> {companies[0].trustScore}/100</p>
            <p><span className="font-medium">Active Jobs:</span> {companies[0].jobCount}</p>
            <div className="mt-4 space-x-2">
              <Link 
                href="/employer/job-postings"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Post Job
              </Link>
              <Link 
                href="/employer/company-trust-score"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                View Trust Score
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Job Postings</h2>
          <Link 
            href="/dashboard/job-search"
            className="text-blue-600 hover:text-blue-700"
          >
            View All →
          </Link>
        </div>
        {loadingData ? (
          <p className="text-gray-500">Loading jobs...</p>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.jobId} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-500">Company: {job.company}</p>
                <p className="text-sm text-gray-500">Min Trust Score: {job.minTrustScore}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No jobs found. Seed some data first!</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/dashboard/job-search"
          className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 text-center"
        >
          <h3 className="font-bold text-lg mb-2">Browse Jobs</h3>
          <p className="text-sm">Find your next opportunity</p>
        </Link>
        <Link 
          href="/auth/kyc-verification"
          className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 text-center"
        >
          <h3 className="font-bold text-lg mb-2">Complete KYC</h3>
          <p className="text-sm">Verify your identity</p>
        </Link>
        <Link 
          href="/employer/job-postings"
          className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 text-center"
        >
          <h3 className="font-bold text-lg mb-2">Post a Job</h3>
          <p className="text-sm">Hire top talent</p>
        </Link>
      </div>
    </div>
  );
}


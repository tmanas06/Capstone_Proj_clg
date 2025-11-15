'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useContract } from '@/hooks/useContract';
import JobCard from '@/components/job/JobCard';

interface Job {
  jobId: string;
  company: string;
  title: string;
  description: string;
  minTrustScore: number;
  requiredCredentials: string[];
}

export default function JobSearch() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState({
    keyword: '',
    minTrustScore: 0,
    location: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { address } = useAccount();
  const { jobPostingContract, userVerificationContract, signer, contractAddresses, contractABIs, executeTransaction } = useContract();

  useEffect(() => {
    // Fetch jobs when contract is available (doesn't require wallet for reads)
    if (jobPostingContract) {
      fetchJobs();
    } else {
      console.log('Waiting for contract to initialize...');
    }
  }, [filters, jobPostingContract]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      if (!jobPostingContract) {
        console.error('JobPosting contract is null!');
        console.log('Contract address:', process.env.NEXT_PUBLIC_JOB_POSTING_ADDRESS);
        setJobs([]);
        return;
      }

      console.log('📊 Fetching jobs from blockchain...');
      console.log('Contract address:', jobPostingContract.address);
      console.log('Provider URL:', (jobPostingContract.provider as any)?.connection?.url || 'localhost');
      
      // Verify contract exists
      console.log('🔍 Verifying contract exists...');
      const code = await jobPostingContract.provider.getCode(jobPostingContract.address);
      console.log('Contract code exists:', code !== '0x' ? '✅ YES' : '❌ NO');
      
      if (code === '0x') {
        const errorMsg = 'Contract does not exist at this address. Hardhat node may have been restarted. Please redeploy contracts.';
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Read jobs directly from blockchain
      const jobsData: Job[] = [];
      
      // First, get total jobs count
      let totalJobs = 0;
      try {
        console.log('✅ Contract verified, calling getTotalJobs()...');
        totalJobs = (await jobPostingContract.getTotalJobs()).toNumber();
        console.log('✅ Total jobs found:', totalJobs);
      } catch (e: any) {
        console.warn('⚠️ getTotalJobs failed:', e.message);
        console.log('Error details:', {
          message: e.message,
          code: e.code,
          contractAddress: jobPostingContract.address
        });
        console.log('🔄 Trying fallback: fetching jobs manually (up to 10)...');
        totalJobs = 10; // Fallback: try up to 10 jobs
      }
      
      // Fetch jobs by iterating through job IDs
      for (let jobId = 1; jobId <= totalJobs; jobId++) {
        try {
          console.log(`Fetching job ${jobId}...`);
          
          // Use the new getJobDetails() function which returns only the fields we need
          // This avoids the overflow issue with large uint256 values
          let jobDetails: any;
          
          try {
            // Try the new getJobDetails function first (if contract has been updated)
            jobDetails = await jobPostingContract.getJobDetails(jobId);
          } catch (e: any) {
            // If getJobDetails doesn't exist (old contract), fall back to jobs() method
            if (e.message?.includes('getJobDetails') || e.message?.includes('not found')) {
              console.log(`getJobDetails not available, using jobs() method...`);
              // Fall back to the old method (will likely cause overflow)
              const jobResult = await jobPostingContract.jobs(jobId);
              // Extract only safe fields
              jobDetails = {
                companyAddress: jobResult.companyAddress,
                positionTitle: jobResult.positionTitle,
                description: jobResult.description,
                requiredCredentials: jobResult.requiredCredentials || [],
                minimumTrustScore: jobResult.minimumTrustScore
              };
            } else {
              throw e;
            }
          }
          
          // Extract fields from jobDetails
          const companyAddress = jobDetails.companyAddress || jobDetails[0];
          const positionTitle = jobDetails.positionTitle || jobDetails[1];
          const description = jobDetails.description || jobDetails[2];
          const requiredCredentials = jobDetails.requiredCredentials || jobDetails[3] || [];
          const minimumTrustScore = jobDetails.minimumTrustScore || jobDetails[4];
          
          // Convert minimumTrustScore safely (uint8 - always safe)
          let minTrustScore = 0;
          if (minimumTrustScore !== undefined && minimumTrustScore !== null) {
            try {
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
            } catch (e) {
              minTrustScore = 0;
            }
          }
          
          // Convert credentials
          const credentials: string[] = [];
          if (requiredCredentials && Array.isArray(requiredCredentials)) {
            requiredCredentials.forEach((cred: any) => {
              if (typeof cred === 'string') {
                credentials.push(cred);
              } else if (cred) {
                credentials.push(String(cred));
              }
            });
          }
          
          // Check if job exists and add it
          if (companyAddress && companyAddress !== '0x0000000000000000000000000000000000000000') {
            jobsData.push({
              jobId: jobId.toString(),
              company: companyAddress,
              title: positionTitle || `Job #${jobId}`,
              description: description || 'No description available',
              minTrustScore: minTrustScore,
              requiredCredentials: credentials,
            });
            console.log(`✓ Job ${jobId} added: ${positionTitle || `Job #${jobId}`}`);
          } else {
            console.log(`Job ${jobId} has invalid company address`);
          }
        } catch (e: any) {
          // Handle errors
          if (e.code === 'NUMERIC_FAULT' && e.fault === 'overflow') {
            console.warn(`⚠️ Job ${jobId}: Overflow error - contract needs to be updated with getJobDetails()`);
            console.warn(`   Please redeploy contract with the new getJobDetails() function`);
            // Skip this job
          } else {
            console.log(`Job ${jobId} error:`, e.message || e);
            // If we get a revert, likely no more jobs
            if (e.message?.includes('revert') || e.code === 'CALL_EXCEPTION') {
              console.log('No more jobs found, stopping...');
              break;
            }
          }
        }
      }
      
      console.log(`Total jobs fetched: ${jobsData.length}`);
      
      // Filter jobs based on search criteria
      const filtered = jobsData.filter(job => {
        if (filters.keyword && !job.title.toLowerCase().includes(filters.keyword.toLowerCase())) {
          return false;
        }
        if (filters.minTrustScore && job.minTrustScore < filters.minTrustScore) {
          return false;
        }
        return true;
      });
      
      setJobs(filtered);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyJob = async (jobId: string) => {
    if (!address) {
      alert('Please connect your wallet to apply for jobs');
      return;
    }

    if (!signer) {
      alert('Wallet signer not available. Please ensure your wallet is connected and on the correct network (Localhost).');
      return;
    }

    if (!contractAddresses?.jobPosting || !contractABIs?.jobPosting) {
      alert('Contract not initialized. Please refresh the page.');
      return;
    }

    // Check KYC status before applying
    try {
      if (userVerificationContract) {
        const [kycComplete] = await userVerificationContract.getVerificationStatus(address);
        if (!kycComplete) {
          const proceed = confirm(
            'KYC verification required to apply for jobs.\n\n' +
            'Would you like to complete KYC now?\n' +
            '(Click OK to go to KYC page, Cancel to use a different account)'
          );
          if (proceed) {
            window.location.href = '/auth/kyc-verification';
          }
          return;
        }
      }
    } catch (kycError: any) {
      console.warn('Could not check KYC status:', kycError);
      // Continue anyway - let the contract revert if needed
    }

    try {
      console.log('Applying for job:', jobId);
      console.log('Using signer:', signer);
      
      // Use executeTransaction helper which creates a contract with signer
      const receipt = await executeTransaction(
        contractAddresses.jobPosting,
        contractABIs.jobPosting,
        'applyForJob',
        [
          parseInt(jobId, 10), // Convert string to number
          '', // coverLetter IPFS hash
          [] // submittedCredentials
        ],
        (receipt) => {
          console.log('Application successful!', receipt);
          alert('Application submitted successfully!');
          fetchJobs(); // Refresh job list
        },
        (error) => {
          console.error('Application failed:', error);
          alert('Failed to submit application: ' + error.message);
        }
      );
      
      if (!receipt) {
        // Error already handled in onError callback
        return;
      }
    } catch (error: any) {
      console.error('Application error:', error);
      alert('Failed to submit application: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Find Jobs</h1>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={filters.keyword}
            onChange={(e) => setFilters({...filters, keyword: e.target.value})}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Min Trust Score"
            value={filters.minTrustScore}
            onChange={(e) => setFilters({...filters, minTrustScore: parseInt(e.target.value) || 0})}
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
            className="px-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="text-center py-8">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No jobs found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.jobId}
              job={job}
              onApply={() => handleApplyJob(job.jobId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}


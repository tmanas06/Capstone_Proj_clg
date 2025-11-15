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
  const { jobPostingContract } = useContract();

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
          // Access the public jobs mapping
          const job = await jobPostingContract.jobs(jobId);
          console.log(`Job ${jobId} data:`, job);
          
          // Check if job exists (has a company address that's not zero)
          if (job && job.companyAddress && job.companyAddress !== '0x0000000000000000000000000000000000000000') {
            jobsData.push({
              jobId: jobId.toString(),
              company: job.companyAddress,
              title: job.positionTitle || `Job #${jobId}`,
              description: job.description || 'No description available',
              minTrustScore: job.minimumTrustScore || 0,
              requiredCredentials: job.requiredCredentials || [],
            });
            console.log(`✓ Job ${jobId} added: ${job.positionTitle}`);
          } else {
            console.log(`Job ${jobId} has invalid company address`);
          }
        } catch (e: any) {
          // Job doesn't exist or error accessing it
          console.log(`Job ${jobId} error:`, e.message || e);
          // If we get a revert, likely no more jobs
          if (e.message?.includes('revert') || e.code === 'CALL_EXCEPTION') {
            console.log('No more jobs found, stopping...');
            break;
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
      alert('Please connect your wallet');
      return;
    }

    try {
      if (!jobPostingContract) {
        throw new Error('Contract not initialized');
      }

      const tx = await jobPostingContract.applyForJob(
        jobId,
        '', // coverLetter IPFS hash
        [] // submittedCredentials
      );
      
      await tx.wait();
      alert('Application submitted successfully!');
      fetchJobs(); // Refresh
    } catch (error: any) {
      console.error('Application failed:', error);
      alert('Failed to submit application: ' + error.message);
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


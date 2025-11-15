'use client';

import React from 'react';

interface JobCardProps {
  job: {
    jobId: string;
    company: string;
    title: string;
    description: string;
    minTrustScore: number;
    requiredCredentials?: string[];
  };
  onApply: () => void;
}

export default function JobCard({ job, onApply }: JobCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
      <h3 className="text-xl font-bold mb-2">{job.title}</h3>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {job.description}
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <span className="font-medium">Company:</span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {job.company.slice(0, 6)}...{job.company.slice(-4)}
          </span>
        </div>
        
        <div className="flex items-center text-sm">
          <span className="font-medium">Min Trust Score:</span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            {job.minTrustScore}
          </span>
        </div>
        
        {job.requiredCredentials && job.requiredCredentials.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Required Credentials:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {job.requiredCredentials.map((cred, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs"
                >
                  {cred}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={onApply}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Apply Now
      </button>
    </div>
  );
}


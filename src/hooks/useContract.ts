"use client";

import { useState, useEffect } from 'react';
import { utils } from 'ethers';
const { parseEther } = utils;
import { useWeb3 } from '../contexts/Web3Context';

type ContractMethod = {
  name: string;
  params?: any[];
  value?: string;
};

export const useContract = () => {
  const { web3JobPlatform, userProfile, platformToken } = useWeb3();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const callMethod = async ({
    contractType,
    method,
    onSuccess,
    onError,
  }: {
    contractType: 'web3JobPlatform' | 'userProfile' | 'platformToken';
    method: ContractMethod;
    onSuccess?: (result: any) => void;
    onError?: (error: Error) => void;
  }) => {
    if (!web3JobPlatform || !userProfile || !platformToken) {
      const err = new Error('Contracts not initialized');
      setError(err.message);
      onError?.(err);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const contract = {
        web3JobPlatform,
        userProfile,
        platformToken,
      }[contractType];

      if (!contract) {
        throw new Error('Invalid contract type');
      }

      const tx = await contract[method.name](...(method.params || []), {
        value: method.value ? parseEther(method.value) : 0,
      });

      // If it's a transaction, wait for it to be mined
      const receipt = tx.wait ? await tx.wait() : tx;
      setResult(receipt);
      onSuccess?.(receipt);
      return receipt;
    } catch (err: any) {
      console.error(`Error calling ${method.name}:`, err);
      const errorMsg = err.reason || err.message || 'An error occurred';
      setError(errorMsg);
      onError?.(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Helper methods for common operations
  const registerUser = async (name: string, email: string, isCompany: boolean) => {
    return callMethod({
      contractType: 'userProfile',
      method: {
        name: 'registerUser',
        params: [name, email, isCompany],
      },
    });
  };

  const createJobPosting = async (
    title: string,
    description: string,
    reward: string
  ) => {
    return callMethod({
      contractType: 'web3JobPlatform',
      method: {
        name: 'createJobPosting',
        params: [title, description],
        value: reward,
      },
    });
  };

  const applyForJob = async (jobId: number) => {
    return callMethod({
      contractType: 'web3JobPlatform',
      method: {
        name: 'applyForJob',
        params: [jobId],
      },
    });
  };

  // Add more helper methods as needed

  return {
    callMethod,
    registerUser,
    createJobPosting,
    applyForJob,
    loading,
    error,
    result,
  };
};

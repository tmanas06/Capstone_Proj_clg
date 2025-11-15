"use client";

import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

// Contract addresses - from deployment file or environment variables
// Fallback to latest deployed addresses (updated after redeployment)
const CONTRACT_ADDRESSES = {
  userVerification: process.env.NEXT_PUBLIC_USER_VERIFICATION_ADDRESS || '0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44',
  companyVerification: process.env.NEXT_PUBLIC_COMPANY_VERIFICATION_ADDRESS || '0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f',
  credentialRegistry: process.env.NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS || '0x4A679253410272dd5232B3Ff7cF5dbB88f295319',
  jobPosting: process.env.NEXT_PUBLIC_JOB_POSTING_ADDRESS || '0x7a2088a1bFc9d81c55368AE168C2C02570cB814F',
  disputeResolution: process.env.NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS || '0x09635F643e140090A9A8Dcd712eD6285858ceBef',
};

// Log contract addresses for debugging (only in browser)
if (typeof window !== 'undefined') {
  console.log('📋 Contract Addresses:', CONTRACT_ADDRESSES);
  console.log('📋 JobPosting Address:', CONTRACT_ADDRESSES.jobPosting);
  console.log('📋 Using env var?', process.env.NEXT_PUBLIC_JOB_POSTING_ADDRESS ? 'YES' : 'NO (using fallback)');
}

// ABI placeholders - in production, these would be imported from typechain-types
const USER_VERIFICATION_ABI = [
  "function initiateKYC(bytes32 _identityHash)",
  "function completeKYC(address _userAddress, bool _status)",
  "function getVerificationStatus(address _user) view returns (bool, bytes32, uint256, uint256)",
  "function grantEmployerAccess(address _employer)",
  "function revokeEmployerAccess(address _employer)",
];

const COMPANY_VERIFICATION_ABI = [
  "function registerCompany(bytes32 _companyHash, address[] _officers)",
  "function verifyCompanyOfficer(address _company, address _officer, bool _status)",
  "function calculateTrustScore(address _company) returns (uint8)",
  "function getCompanyTrustScore(address _company) view returns (uint8)",
  "function getCompanyInfo(address _company) view returns (bytes32, uint256, bool, uint8, uint256, uint256, uint256, uint256)",
  "function recordHire(address _company, address _candidate)",
  "function updateJobPostingCount(address _company)",
];

const CREDENTIAL_REGISTRY_ABI = [
  "function issueCredential(address _candidate, bytes32 _credHash, uint8 _type, uint256 _expiry, string _metadata)",
  "function verifyCredential(bytes32 _credentialId) view returns (bool, bool, bool)",
  "function revokeCredential(bytes32 _credentialId)",
];

const JOB_POSTING_ABI = [
  "function createJobPosting(string _title, string _description, bytes32[] _requiredCreds, uint8 _minScore)",
  "function applyForJob(uint256 _jobId, string _coverLetter, bytes32[] _submittedCredentials)",
  "function getJobApplications(uint256 _jobId) view returns (address[])",
  "function getCompanyActiveJobs(address _company) view returns (uint256[])",
  "function getTotalJobs() view returns (uint256)",
  "function getJobDetails(uint256 _jobId) view returns (address companyAddress, string memory positionTitle, string memory description, bytes32[] memory requiredCredentials, uint8 minimumTrustScore)",
  "function completeHire(uint256 _jobId, address _candidate)",
  "function jobs(uint256) view returns (uint256 jobId, address companyAddress, string memory positionTitle, string memory description, bytes32[] memory requiredCredentials, uint8 minimumTrustScore, uint256 createdTime, address[] memory applications, address hireAddress, uint8 status)",
];

const DISPUTE_RESOLUTION_ABI = [
  "function fileDispute(address _disputedParty, string _reason, bytes32[] _evidence, uint8 _disputeType)",
  "function submitArbitration(uint256 _disputeId, bool _favorDisputer, string _notes)",
  "function getDisputeStatus(uint256 _disputeId) view returns (uint8, address, address, uint8, uint256, bool, uint256)",
];

export const useContract = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get provider and signer - ALWAYS use localhost RPC for reads
  // This ensures we're reading from the correct network
  const { provider, signer } = useMemo(() => {
    // Always use localhost RPC for reading data (works without wallet)
    // This is critical: we always read from localhost regardless of wallet network
    const localhostProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // For writes, get signer from window.ethereum if available
    let signerInstance = null;
    if (typeof window !== 'undefined' && (window as any).ethereum && isConnected && address) {
      try {
        const ethersProvider = new ethers.providers.Web3Provider((window as any).ethereum);
        
        // Check network and warn if wrong
        ethersProvider.getNetwork().then(network => {
          if (network.chainId !== 31337) {
            console.warn(`⚠️ Wallet is on chainId ${network.chainId}, but contracts are on localhost (31337).`);
            console.warn(`   Please switch to Localhost network using the network switcher button.`);
          } else {
            console.log('✓ Wallet is on localhost network (31337)');
          }
        }).catch(e => {
          console.warn('Could not check network (this is OK for read-only operations):', e.message);
        });
        
        signerInstance = ethersProvider.getSigner();
      } catch (e: any) {
        console.warn('Could not get signer from wallet, using read-only mode:', e.message);
      }
    }
    
    // Always log that we're using localhost provider for reads
    if (typeof window !== 'undefined') {
      console.log('📡 Using localhost RPC provider (http://127.0.0.1:8545) for contract reads');
    }
    
    return { provider: localhostProvider, signer: signerInstance };
  }, [address, isConnected]);

  // Initialize contracts - ALWAYS use localhost provider for reads
  // This ensures we read from localhost even if wallet is on a different network
  // Only use signer for write operations (which will be handled separately)
  const userVerificationContract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.userVerification || !provider) return null;
    // Always use provider for reads - don't use signer even if available
    return new ethers.Contract(CONTRACT_ADDRESSES.userVerification, USER_VERIFICATION_ABI, provider);
  }, [provider]);

  const companyVerificationContract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.companyVerification || !provider) return null;
    // Always use provider for reads
    return new ethers.Contract(CONTRACT_ADDRESSES.companyVerification, COMPANY_VERIFICATION_ABI, provider);
  }, [provider]);

  const credentialRegistryContract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.credentialRegistry || !provider) return null;
    // Always use provider for reads
    return new ethers.Contract(CONTRACT_ADDRESSES.credentialRegistry, CREDENTIAL_REGISTRY_ABI, provider);
  }, [provider]);

  const jobPostingContract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.jobPosting || !provider) return null;
    // Always use provider for reads - this ensures we read from localhost
    return new ethers.Contract(CONTRACT_ADDRESSES.jobPosting, JOB_POSTING_ABI, provider);
  }, [provider]);

  const disputeResolutionContract = useMemo(() => {
    if (!CONTRACT_ADDRESSES.disputeResolution || !provider) return null;
    // Always use provider for reads
    return new ethers.Contract(CONTRACT_ADDRESSES.disputeResolution, DISPUTE_RESOLUTION_ABI, provider);
  }, [provider]);

  const executeTransaction = async (
    contractAddress: string,
    abi: any[],
    method: string,
    params: any[],
    onSuccess?: (result: any) => void,
    onError?: (error: Error) => void
  ) => {
    if (!signer) {
      const err = new Error('Wallet not connected. Please connect your wallet to write to the blockchain.');
      setError(err.message);
      onError?.(err);
      return null;
    }

    if (!provider) {
      const err = new Error('Provider not initialized');
      setError(err.message);
      onError?.(err);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // For write operations, create contract with signer
      const writeContract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await writeContract[method](...params);
      const receipt = await tx.wait();
      setLoading(false);
      onSuccess?.(receipt);
      return receipt;
    } catch (err: any) {
      console.error(`Error calling ${method}:`, err);
      const errorMsg = err.reason || err.message || 'An error occurred';
      setError(errorMsg);
      onError?.(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const executeView = async (
    contract: ethers.Contract | null,
    method: string,
    params: any[]
  ) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await contract[method](...params);
    } catch (err: any) {
      console.error(`Error calling ${method}:`, err);
      throw err;
    }
  };

  return {
    // Contracts (read-only, always use localhost provider)
    userVerificationContract,
    companyVerificationContract,
    credentialRegistryContract,
    jobPostingContract,
    disputeResolutionContract,
    
    // Contract addresses and ABIs for write operations
    contractAddresses: CONTRACT_ADDRESSES,
    contractABIs: {
      userVerification: USER_VERIFICATION_ABI,
      companyVerification: COMPANY_VERIFICATION_ABI,
      credentialRegistry: CREDENTIAL_REGISTRY_ABI,
      jobPosting: JOB_POSTING_ABI,
      disputeResolution: DISPUTE_RESOLUTION_ABI,
    } as const,
    
    // Utilities
    executeTransaction,
    executeView,
    signer, // Expose signer for custom write operations
    provider, // Expose provider for custom read operations
    loading,
    error,
  };
};


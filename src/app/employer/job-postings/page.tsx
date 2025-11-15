'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { useContract } from '@/hooks/useContract';
import { ethers } from 'ethers';
import NetworkSwitcher from '@/components/NetworkSwitcher';

// Component to check and display company registration status
function CompanyRegistrationSection({ 
  address, 
  companyVerificationContract, 
  handleRegisterCompany, 
  loading, 
  isCorrectNetwork 
}: {
  address: string | undefined;
  companyVerificationContract: any;
  handleRegisterCompany: () => void;
  loading: boolean;
  isCorrectNetwork: boolean;
}) {
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    const checkCompanyRegistration = async () => {
      if (!address || !companyVerificationContract) {
        setIsRegistered(null);
        setChecking(false);
        return;
      }
      
      setChecking(true);
      try {
        const companyInfo = await companyVerificationContract.getCompanyInfo(address);
        setIsRegistered(companyInfo.registrationTime > 0);
      } catch (err) {
        setIsRegistered(false);
      } finally {
        setChecking(false);
      }
    };
    
    checkCompanyRegistration();
  }, [address, companyVerificationContract]);
  
  if (checking || isRegistered === null || isRegistered) {
    return null;
  }
  
  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <h2 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">Company Registration</h2>
      <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
        Your wallet address is not registered as a company. You need to register first before posting jobs.
      </p>
      <button
        type="button"
        onClick={handleRegisterCompany}
        disabled={loading || !isCorrectNetwork}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        Register My Company
      </button>
      {!isCorrectNetwork && (
        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
          ⚠️ Please switch to Localhost network first
        </p>
      )}
      <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
        <strong>Note:</strong> For testing, you can use one of the seeded company accounts: 
        <code className="ml-1 px-1 bg-blue-100 dark:bg-blue-900 rounded">0x90F79bf6EB2c4f870365E785982E1f101E93b906</code> or 
        <code className="ml-1 px-1 bg-blue-100 dark:bg-blue-900 rounded">0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65</code>
      </p>
    </div>
  );
}

export default function JobPostings() {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { jobPostingContract, companyVerificationContract, signer, contractAddresses, contractABIs } = useContract();
  
  // Check if wallet is on correct network
  const isCorrectNetwork = chain?.id === 31337; // localhost
  const currentChainId = chain?.id || 0;
  
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

      // Check network BEFORE proceeding
      if (!isCorrectNetwork) {
        setError(`Please switch your wallet to Localhost network (Chain ID: 31337) first. Current network: ${chain?.name || `Chain ${currentChainId}`} (${currentChainId})`);
        setLoading(false);
        return;
      }

      // Create job posting on blockchain - need to use signer for write operations
      if (!signer || !contractAddresses || !contractABIs) {
        setError('Wallet signer not available. Please ensure your wallet is connected and on Localhost network.');
        setLoading(false);
        return;
      }

      // Double-check network from the signer's provider
      try {
        const signerNetwork = await signer.provider.getNetwork();
        if (signerNetwork.chainId !== 31337) {
          setError(`Network mismatch: Signer is on Chain ID ${signerNetwork.chainId}, but contracts are on 31337. Please switch to Localhost network.`);
          setLoading(false);
          return;
        }
      } catch (networkError: any) {
        console.warn('Could not verify network from signer:', networkError);
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

    // Check network BEFORE proceeding
    if (!isCorrectNetwork) {
      const currentNetworkName = chain?.name || `Chain ${currentChainId}`;
      const switchNetwork = confirm(
        `Your wallet is on ${currentNetworkName} (Chain ID: ${currentChainId}), but contracts are on Localhost (31337).\n\n` +
        `Would you like to switch to Localhost network now?\n\n` +
        `(Click OK to switch, Cancel to do it manually)`
      );
      
      if (switchNetwork) {
        // Try to switch network using MetaMask
        try {
          if (typeof window !== 'undefined' && (window as any).ethereum) {
            await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x7A69' }], // 31337 in hex
            });
            // Wait a moment for network to switch, then retry
            setTimeout(() => {
              handleRegisterCompany();
            }, 1000);
            return;
          }
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Chain not added, try to add it
            try {
              await (window as any).ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x7A69',
                  chainName: 'Localhost 8545',
                  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                  rpcUrls: ['http://127.0.0.1:8545'],
                }],
              });
              setTimeout(() => {
                handleRegisterCompany();
              }, 1000);
              return;
            } catch (addError) {
              setError('Failed to add Localhost network. Please add it manually in MetaMask.');
              return;
            }
          } else {
            setError(`Please switch your wallet to Localhost network (Chain ID: 31337) first. Current network: ${currentNetworkName} (${currentChainId})`);
            return;
          }
        }
      } else {
        setError(`Please switch your wallet to Localhost network (Chain ID: 31337) first. Current network: ${currentNetworkName} (${currentChainId})`);
        return;
      }
    }

    if (!signer || !contractAddresses || !contractABIs) {
      setError('Wallet signer not available. Please ensure your wallet is connected and on Localhost network.');
      return;
    }

    // Double-check network from the signer's provider
    try {
      const signerNetwork = await signer.provider.getNetwork();
      if (signerNetwork.chainId !== 31337) {
        setError(`Network mismatch: Signer is on Chain ID ${signerNetwork.chainId}, but contracts are on 31337. Please switch to Localhost network.`);
        return;
      }
    } catch (networkError: any) {
      console.warn('Could not verify network from signer:', networkError);
      // Continue anyway, but log warning
    }

    setLoading(true);
    setError(null);

    try {
      // Register company with a simple hash
      const companyName = `Company-${address.slice(0, 8)}`;
      const companyHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(companyName));

      // Create contract with signer - this will use the network the signer is on
      const writeContract = new ethers.Contract(
        contractAddresses.companyVerification,
        contractABIs.companyVerification,
        signer
      );

      console.log('Registering company on network:', await signer.provider.getNetwork());
      console.log('Contract address:', contractAddresses.companyVerification);

      const tx = await writeContract.registerCompany(
        companyHash,
        [address] // Single officer (themselves)
      );
      
      console.log('Transaction sent, waiting for confirmation...');
      const receipt = await tx.wait();
      
      console.log('Company registered! Transaction hash:', receipt.transactionHash);
      
      alert('Company registered successfully! Transaction: ' + receipt.transactionHash + '\n\nNote: Company verification by admin is required before posting jobs. For testing, you can use one of the seeded company accounts.');
      
      // Refresh the page to update company registration status
      window.location.reload();
      
    } catch (err: any) {
      console.error('Company registration failed:', err);
      
      // Check for network-related errors
      if (err.message?.includes('chainId') || err.message?.includes('network') || err.message?.includes('wrong chain')) {
        setError('Network error: Please ensure your wallet is on Localhost network (Chain ID: 31337). Click the network switcher button or switch manually in MetaMask.');
      } else if (err.message?.includes('user rejected') || err.code === 4001) {
        setError('Transaction was rejected. Please try again.');
      } else if (err.message?.includes('insufficient funds')) {
        setError('Insufficient funds. Please ensure you have ETH in your wallet on the Localhost network.');
      } else {
        setError(err.message || 'Failed to register company. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Post a Job</h1>
      
      {/* Network Status - Show success or warning */}
      {chain && (
        <>
          {isCorrectNetwork ? (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div className="flex-1">
                  <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                    Connected to Localhost Network (Chain ID: {currentChainId})
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                    Your wallet is on the correct network. You can now post jobs and interact with contracts.
                  </p>
                </div>
                <NetworkSwitcher />
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm font-semibold mb-2">
                    Network Mismatch Detected
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                    Your wallet is on <strong>{chain.name || `Chain ${currentChainId}`} (Chain ID: {currentChainId})</strong>, 
                    but contracts are deployed on <strong>Localhost (Chain ID: 31337)</strong>.
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <NetworkSwitcher />
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      Or manually add Localhost network in MetaMask: Settings → Networks → Add Network
                    </p>
                  </div>
                  <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Manual Setup:</strong> Network Name: "Localhost 8545", RPC URL: "http://127.0.0.1:8545", Chain ID: "31337", Currency Symbol: "ETH"
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {!chain && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            ⚠️ Unable to detect network. Please ensure your wallet is connected.
          </p>
        </div>
      )}

      {/* Company Registration Section - Only show if not registered */}
      <CompanyRegistrationSection 
        address={address}
        companyVerificationContract={companyVerificationContract}
        handleRegisterCompany={handleRegisterCompany}
        loading={loading}
        isCorrectNetwork={isCorrectNetwork}
      />
      
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


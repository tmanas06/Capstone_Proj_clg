'use client';

import { useNetwork } from 'wagmi';
import { useState } from 'react';

export default function NetworkSwitcher() {
  const { chain, chains } = useNetwork();
  const [showModal, setShowModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Available networks (prioritize localhost for development)
  const availableChains = chains.filter(c => 
    c.id === 31337 || // localhost
    c.id === 1337 || // hardhat
    c.id === 11155111 || // sepolia
    c.id === 1 // mainnet
  );

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 31337:
        return 'Localhost';
      case 1337:
        return 'Hardhat';
      case 11155111:
        return 'Sepolia';
      case 1:
        return 'Mainnet';
      default:
        return `Chain ${chainId}`;
    }
  };

  const getChainColor = (chainId: number) => {
    switch (chainId) {
      case 31337:
        return 'bg-green-500';
      case 1337:
        return 'bg-blue-500';
      case 11155111:
        return 'bg-purple-500';
      case 1:
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (!chain) {
    return null;
  }

  const isCorrectNetwork = chain.id === 31337; // Contracts are on localhost

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        type="button"
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isCorrectNetwork
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700'
            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <span>{getChainName(chain.id)}</span>
        {!isCorrectNetwork && (
          <span className="text-xs">(Switch)</span>
        )}
      </button>

      {/* Network Switcher Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Switch Network</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Current Network: <span className="font-medium">{getChainName(chain.id)} (Chain ID: {chain.id})</span>
              </p>
              {!isCorrectNetwork && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Contracts are deployed on <strong>Localhost (31337)</strong>. Please switch to continue.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {availableChains.map((availableChain) => {
                const isActive = chain.id === availableChain.id;
                const isRecommended = availableChain.id === 31337;

                return (
                  <button
                    key={availableChain.id}
                    onClick={async () => {
                      if (availableChain.id !== chain?.id) {
                        setIsPending(true);
                        try {
                          // Try to use wagmi's switchNetwork if available, otherwise use direct wallet request
                          if (typeof window !== 'undefined' && (window as any).ethereum) {
                            try {
                              // Request to switch network
                              await (window as any).ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: `0x${availableChain.id.toString(16)}` }],
                              });
                              setShowModal(false);
                            } catch (switchError: any) {
                              // This error code indicates that the chain has not been added to MetaMask
                              if (switchError.code === 4902) {
                                // Try to add the network
                                try {
                                  const chainConfig = {
                                    chainId: `0x${availableChain.id.toString(16)}`,
                                    chainName: getChainName(availableChain.id),
                                    nativeCurrency: {
                                      name: 'Ether',
                                      symbol: 'ETH',
                                      decimals: 18,
                                    },
                                    rpcUrls: availableChain.id === 31337 
                                      ? ['http://127.0.0.1:8545']
                                      : availableChain.rpcUrls.default.http,
                                  };
                                  
                                  await (window as any).ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [chainConfig],
                                  });
                                  setShowModal(false);
                                } catch (addError: any) {
                                  console.error('Add network error:', addError);
                                  alert(`Failed to add network: ${addError.message}`);
                                }
                              } else if (switchError.code === 4001) {
                                // User rejected the request
                                console.log('User rejected network switch');
                              } else {
                                console.error('Network switch error:', switchError);
                                alert(`Failed to switch network: ${switchError.message}`);
                              }
                            }
                          } else {
                            alert('Wallet not detected. Please install MetaMask or another Web3 wallet.');
                          }
                        } catch (error: any) {
                          console.error('Network switch error:', error);
                          alert(`Failed to switch network: ${error.message}`);
                        } finally {
                          setIsPending(false);
                        }
                      } else {
                        setShowModal(false);
                      }
                    }}
                    disabled={isActive || isPending}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      isActive
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getChainColor(availableChain.id)}`}></div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {getChainName(availableChain.id)}
                          {isRecommended && (
                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Chain ID: {availableChain.id}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-green-600 dark:text-green-400 font-medium">✓ Active</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Can't find Localhost network? Add it manually in your wallet settings.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


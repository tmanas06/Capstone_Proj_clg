'use client';

import { useAccount, useDisconnect, useNetwork, useConnect } from 'wagmi';
import { Button } from './ui/button';
import { WalletIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center">
        <Button
          onClick={() => setShowModal(true)}
          className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          disabled={!mounted}
        >
          <WalletIcon className="w-5 h-5 mr-2" />
          {mounted ? 'Connect Wallet' : 'Loading...'}
        </Button>

        {/* WalletConnect Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Connect Wallet</h2>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => {
                        connect({ connector });
                        setShowModal(false);
                      }}
                      disabled={!connector.ready}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                          {connector.name.includes('MetaMask') && '🦊'}
                          {connector.name.includes('WalletConnect') && '🔗'}
                          {connector.name.includes('Coinbase') && '🪙'}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {connector.name}
                          {!connector.ready && ' (unsupported)'}
                        </span>
                      </div>
                      {isLoading && pendingConnector?.id === connector.id && (
                        <span className="text-sm text-gray-500">Connecting...</span>
                      )}
                    </button>
                  ))}
                </div>
                
                <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                  By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="flex items-center space-x-3">
        {/* Network Indicator */}
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            {chain?.name || 'Unknown Network'}
          </span>
        </div>
        
        {/* Wallet Address */}
        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
          </span>
        </div>
        
        {/* Disconnect Button */}
        <Button
          onClick={() => disconnect()}
          variant="secondary"
          size="sm"
          className="text-indigo-700 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-700"
        >
          Disconnect
        </Button>
      </div>
      
      {/* Network Info */}
      {chain && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Network ID: {chain.id} • {chain.testnet ? 'Testnet' : 'Mainnet'}
        </div>
      )}
    </div>
  );
}

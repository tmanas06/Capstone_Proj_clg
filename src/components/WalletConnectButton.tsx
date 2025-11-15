'use client';

import { useAccount, useNetwork, useConnect, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';
import NetworkSwitcher from './NetworkSwitcher';

export default function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showModal, setShowModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // Log available connectors for debugging
  useEffect(() => {
    if (connectors && connectors.length > 0) {
      console.log('🔌 Available connectors from useConnect:', connectors.length);
      connectors.forEach((connector, index) => {
        console.log(`  ${index + 1}. ${connector.name || connector.id} - Ready: ${connector.ready}`);
      });
    } else {
      console.warn('⚠️ No connectors available from useConnect hook');
    }
  }, [connectors]);

  // If connected, show account info with disconnect option
  if (isConnected && address) {
    return (
      <>
        <div className="flex items-center gap-3">
          {/* Network Switcher */}
          <NetworkSwitcher />
          
          <button
            onClick={() => setShowAccountModal(true)}
            type="button"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {address.slice(0, 6)}...{address.slice(-4)}
          </button>

          {/* Direct Disconnect Button - Always Visible */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to disconnect your wallet?')) {
                disconnect();
              }
            }}
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            title="Disconnect Wallet"
          >
            Disconnect
          </button>
        </div>

        {/* Account Modal with Disconnect */}
        {showAccountModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAccountModal(false)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Account</h2>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Connected Account</div>
                  <div className="font-mono text-sm text-gray-900 dark:text-white break-all">
                    {address}
                  </div>
                </div>

                {chain && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Network</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {chain.name} (Chain ID: {chain.id})
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    disconnect();
                    setShowAccountModal(false);
                  }}
                  type="button"
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Not connected - show connect button
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        type="button"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
      >
        Connect Wallet
      </button>

      {/* Custom wallet modal */}
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Connect a Wallet</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              {connectors && connectors.length > 0 ? (
                connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={async () => {
                      try {
                        await connect({ connector });
                        setShowModal(false);
                      } catch (error) {
                        console.error('Connection error:', error);
                        alert('Failed to connect wallet. Please try again.');
                      }
                    }}
                    disabled={!connector.ready || isPending}
                    className="w-full flex items-center justify-between p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-300 font-bold">
                          {connector.name?.charAt(0) || 'W'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {connector.name || connector.id}
                        </div>
                        {!connector.ready && (
                          <div className="text-xs text-gray-500">Not available</div>
                        )}
                      </div>
                    </div>
                    {connector.ready && (
                      <span className="text-gray-400">→</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No wallets detected</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                    Please install MetaMask or another Web3 wallet extension
                  </p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Install MetaMask →
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                New to Ethereum wallets?{' '}
                <a
                  href="https://ethereum.org/en/wallets/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Learn More
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

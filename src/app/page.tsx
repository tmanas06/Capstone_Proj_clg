'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import WalletConnectButton from '@/components/WalletConnectButton';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            JobVerify
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Decentralized Job Platform with Blockchain Verification
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Connect with verified employers and candidates. Built on blockchain for trust, transparency, and security.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {!isConnected ? (
              <WalletConnectButton />
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/dashboard/job-search"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Browse Jobs
                </Link>
              </>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold mb-2">Blockchain Verification</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Identity verification using Self Protocol with zero-knowledge proofs
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-2">AI Fraud Detection</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Machine learning models detect and prevent fraudulent activities
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📜</div>
              <h3 className="text-xl font-bold mb-2">Credential Registry</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Verified credentials stored on-chain for transparency
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-blue-600">5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Smart Contracts</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Decentralized</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-purple-600">ZK</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Zero-Knowledge</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-orange-600">AI</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Fraud Detection</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

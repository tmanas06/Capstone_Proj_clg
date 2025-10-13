import { useMemo, useState } from 'react'
import { useAppStore } from '../store'

export default function RewardsPage() {
    const balance = useAppStore(s => s.balance)
    const stake = useAppStore(s => s.stake)
    const unstake = useAppStore(s => s.unstake)
    const accrueRewards = useAppStore(s => s.accrueRewards)
    const staked = useAppStore(s => s.staked)
    const [amount, setAmount] = useState('')

    const accrued = useMemo(() => accrueRewards(), [accrueRewards])

    return (
        <div className="w-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Rewards & Staking
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Manage your POSTMINT tokens and earn rewards through staking
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Balance Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Total Balance</h2>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{balance.toFixed(2)}</div>
                            <div className="text-lg text-indigo-600 dark:text-indigo-400 font-semibold">POSTMINT</div>
                        </div>
                    </div>

                    {/* Staking Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stake Tokens</h2>
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Amount to Stake
                                    </label>
                                    <input 
                                        className="w-full rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                                        placeholder="Enter amount" 
                                        value={amount} 
                                        onChange={e => setAmount(e.target.value)} 
                                    />
                                </div>
                                <div className="sm:flex-shrink-0">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        &nbsp;
                                    </label>
                                    <button 
                                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
                                        onClick={() => { const n = Number(amount); if (n>0) { stake(n); setAmount('') } }}
                                    >
                                        Stake Tokens
                                    </button>
                                </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                        Accrued Rewards: {accrued.toFixed(2)} POSTMINT
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Staking Positions */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Active Positions</h2>
                        {staked.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No active positions</h3>
                                <p className="text-gray-600 dark:text-gray-300">Start staking tokens to earn daily rewards</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {staked.map(p => {
                                    const days = (Date.now() - p.startMs) / (1000 * 60 * 60 * 24)
                                    const reward = p.amount * p.rewardPerDay * days
                                    return (
                                        <div key={p.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                {p.amount.toFixed(2)} POSTMINT
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                Staked {days.toFixed(1)} days ago
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Daily Rate:</span>
                                                            <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                                                                {(p.rewardPerDay * 100).toFixed(2)}%
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">Earned:</span>
                                                            <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                                                                {reward.toFixed(2)} POSTMINT
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                                                    onClick={() => unstake(p.id)}
                                                >
                                                    Unstake
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

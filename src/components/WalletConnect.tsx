import { useWeb3 } from '../contexts/Web3Context';

export const WalletConnect = () => {
  const { connect, disconnect, isConnected, formattedAccount, loading, error } = useWeb3();

  if (loading) {
    return (
      <button 
        className="px-4 py-2 bg-gray-500 text-white rounded-md cursor-not-allowed"
        disabled
      >
        Connecting...
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">
          {formattedAccount}
        </span>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={connect}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Connect Wallet
      </button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

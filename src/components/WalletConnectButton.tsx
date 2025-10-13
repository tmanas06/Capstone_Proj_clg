'use client';

'use client';

import { useAccount, useDisconnect, useNetwork } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from './ui/button';

export default function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal, account, mounted }) => {
          return (
            <Button
              onClick={openConnectModal}
              variant="primary"
              className="ml-4 shadow-sm"
              disabled={!mounted}
            >
              {mounted ? 'Connect Wallet' : 'Loading...'}
            </Button>
          );
        }}
      </ConnectButton.Custom>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {chain ? `${chain.name} (${chain.id})` : 'Unknown Network'}
        </span>
      </div>
      <Button
        onClick={() => disconnect()}
        variant="danger"
        className="ml-4 shadow-sm"
      >
        Disconnect
      </Button>
    </div>
  );
}

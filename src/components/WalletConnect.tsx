'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import WalletConnectButton from './WalletConnectButton';

export const WalletConnect = () => {
  // This component is now just a wrapper for WalletConnectButton
  // Use WalletConnectButton directly instead
  return <WalletConnectButton />;
};

"use client";

import { createContext, useContext, useMemo } from 'react';
import { useAccount, useDisconnect, useNetwork } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

type Web3ContextType = {
  isConnected: boolean;
  address?: `0x${string}`;
  chainId?: number;
  formattedAddress: string;
  isLoading: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
};

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3ContextProvider({ children }: { children: React.ReactNode }) {
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { address, isConnected, isConnecting } = useAccount();
  const { chain } = useNetwork();
  
  // Format address for display
  const formattedAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  // Handle connection
  const handleConnect = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  // Handle disconnection
  const handleDisconnect = () => {
    try {
      disconnect();
    } catch (err) {
      console.error('Disconnection error:', err);
    }
  };

  const value = useMemo(
    () => ({
      isConnected: !!isConnected,
      address,
      chainId: chain?.id,
      formattedAddress,
      isLoading: isConnecting,
      error: null, // RainbowKit handles errors internally
      connect: handleConnect,
      disconnect: handleDisconnect,
    }),
    [isConnected, address, chain?.id, formattedAddress, isConnecting, openConnectModal, disconnect]
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}

export default Web3Context;

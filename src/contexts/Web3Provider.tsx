'use client';

import { RainbowKitProvider, getDefaultWallets, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, hardhat],
  [publicProvider()]
);

// Configure RainbowKit
const { connectors } = getDefaultWallets({
  appName: 'Web3 Job Platform',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains,
});

// Create wagmi config
const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return null;
  }

  // Configure RainbowKit theme based on Next.js theme
  const rainbowKitTheme = theme === 'dark' 
    ? darkTheme({
        accentColor: '#7C3AED',
        accentColorForeground: 'white',
        borderRadius: 'medium',
      })
    : lightTheme({
        accentColor: '#7C3AED',
        accentColorForeground: 'white',
        borderRadius: 'medium',
      });

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          chains={chains}
          theme={
            theme === 'dark' 
              ? darkTheme({
                  accentColor: '#7C3AED',
                  accentColorForeground: 'white',
                  borderRadius: 'medium',
                  fontStack: 'system',
                  overlayBlur: 'small',
                })
              : lightTheme({
                  accentColor: '#7C3AED',
                  accentColorForeground: 'white',
                  borderRadius: 'medium',
                  fontStack: 'system',
                  overlayBlur: 'small',
                })
          }
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

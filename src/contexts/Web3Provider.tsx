'use client';

import { RainbowKitProvider, getDefaultWallets, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia, hardhat, localhost } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

// Configure localhost chain
const localhostChain = {
  ...localhost,
  id: 31337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  testnet: true,
};

// Configure chains & providers
// The localhostChain already has the correct RPC URL configured
// ENS is disabled in wagmi config to prevent errors
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [localhostChain, hardhat, sepolia, mainnet],
  [publicProvider()]
);

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 1000,
    },
  },
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [config, setConfig] = useState<any>(null);

  // Create connectors and config AFTER component mounts (when window.ethereum is available)
  useEffect(() => {
    setMounted(true);

    // Log wallet detection for debugging
    if (typeof window !== 'undefined') {
      console.log('🔍 Wallet Detection:', {
        ethereum: !!(window as any).ethereum,
        isMetaMask: !!(window as any).ethereum?.isMetaMask,
        isBrave: !!(window as any).ethereum?.isBraveWallet,
        providers: (window as any).ethereum?.providers?.length || 0,
      });
    }

    // Get WalletConnect project ID
    const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '';

    // Create connectors - NOW when window.ethereum is definitely available
    let connectors: any[] = [];
    
    // CRITICAL: RainbowKit's modal ONLY shows wallets from getDefaultWallets
    // We MUST use getDefaultWallets, even with a dummy projectId
    // The key is to use a properly formatted 64-character hex string
    const dummyProjectId = '0000000000000000000000000000000000000000000000000000000000000000';
    const effectiveProjectId = projectId && projectId.trim() !== '' ? projectId : dummyProjectId;
    
    try {
      console.log('🔧 Creating connectors with getDefaultWallets...');
      const { connectors: defaultConnectors } = getDefaultWallets({
        appName: 'JobVerify',
        projectId: effectiveProjectId,
        chains,
      });
      
      // getDefaultWallets returns an object with connectors property
      connectors = Array.isArray(defaultConnectors) ? defaultConnectors : [];
      
      console.log(`✅ getDefaultWallets returned ${connectors.length} connectors`);
      
      // Log each connector
      if (connectors.length > 0) {
        connectors.forEach((connector: any, index: number) => {
          const connectorName = connector.name || connector.id || 'Unknown';
          console.log(`  ${index + 1}. ${connectorName}`);
        });
      } else {
        console.warn('⚠️ getDefaultWallets returned 0 connectors!');
        console.warn('This might be because WalletConnect requires a valid projectId.');
        console.warn('Creating fallback wagmi connectors...');
      }
    } catch (error: any) {
      console.error('❌ getDefaultWallets failed:', error);
      console.warn('⚠️ Falling back to wagmi connectors (won\'t show in RainbowKit modal)');
    }

    // CRITICAL FIX: Always create fallback wagmi connectors if getDefaultWallets returned 0
    // These will work with wagmi's useConnect hook even if RainbowKit modal is empty
    if (connectors.length === 0) {
      console.log('🔧 Creating fallback wagmi connectors...');
      const { InjectedConnector } = require('wagmi/connectors/injected');
      const { MetaMaskConnector } = require('wagmi/connectors/metaMask');
      
      connectors = [
        new MetaMaskConnector({ 
          chains,
          options: {
            shimDisconnect: true,
          },
        }),
        new InjectedConnector({ 
          chains,
          options: {
            name: 'Injected',
            shimDisconnect: true,
          },
        }),
      ];
      console.log('✅ Created fallback wagmi connectors:', connectors.length);
      connectors.forEach((connector: any, index: number) => {
        console.log(`  ${index + 1}. ${connector.name || connector.id || 'Unknown'}`);
      });
    }

    // Ensure connectors is an array
    if (!Array.isArray(connectors)) {
      console.error('❌ Connectors is not an array!', typeof connectors, connectors);
      connectors = [];
    }

    // Final check (should never happen now, but keep for safety)
    if (connectors.length === 0) {
      console.error('❌ CRITICAL: No connectors available! Wallet connection will not work.');
      console.error('💡 Solution: Get a free WalletConnect projectId from https://cloud.walletconnect.com');
      console.error('   Then add it to .env.local as: NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_id');
    }

    // Create wagmi config
    const wagmiConfig = createConfig({
      autoConnect: false,
      connectors,
      publicClient,
      webSocketPublicClient,
      // Disable ENS resolution on localhost to prevent errors
      ens: {
        enabled: false,
      },
    });

    setConfig(wagmiConfig);

    return () => {
      setMounted(false);
    };
  }, []); // Only run once on mount

  if (!mounted || !config) {
    return <>{children}</>;
  }

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          chains={chains}
          initialChain={localhostChain}
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
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Web3Provider } from '@/contexts/Web3Provider';
import { Web3ContextProvider } from '@/contexts/Web3Context';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <Web3ContextProvider>
        <ThemeProvider>
          <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </NextThemesProvider>
        </ThemeProvider>
      </Web3ContextProvider>
    </Web3Provider>
  );
}

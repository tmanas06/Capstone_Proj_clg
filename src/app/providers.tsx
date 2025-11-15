'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Web3Provider } from '@/contexts/Web3Provider';
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </NextThemesProvider>
    </Web3Provider>
  );
}

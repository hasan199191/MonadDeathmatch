'use client';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react'; // ReactNode tipini import et
import '@rainbow-me/rainbowkit/styles.css';
import config, { chains } from '@/app/wagmi'; // Mevcut yapılandırmayı import et

// children prop'una ReactNode tipi ekle
export default function RainbowKitProviderWrapper({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
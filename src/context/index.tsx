'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import React, { type ReactNode } from 'react';
import { monadChain } from '@/app/wagmi';

// QueryClient oluştur
const queryClient = new QueryClient();

// Chain yapılandırması
const { chains, publicClient } = configureChains(
  [monadChain],
  [publicProvider()]
);

// Wallet yapılandırması
const { connectors } = getDefaultWallets({
  appName: 'Monad Deathmatch',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains,
});

// Wagmi config
const config = createConfig({
  autoConnect: true,
  publicClient,
  connectors,
});

interface ContextProviderProps {
  children: ReactNode;
  cookies: string | null;
}

function ContextProvider({ children, cookies }: ContextProviderProps) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default ContextProvider;
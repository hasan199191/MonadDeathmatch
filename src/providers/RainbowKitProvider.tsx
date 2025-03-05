// providers/RainbowKitProvider.tsx
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { monadChain } from '@/app/wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Local storage polyfill ekle
if (typeof window !== 'undefined') {
  if (!window.localStorage) {
    window.localStorage = {
      getItem: () => null,
      setItem: () => null,
      removeItem: () => null,
      clear: () => null,
      key: () => null,
      length: 0,
    };
  }
}

function SafeHydrate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <>{children}</> : null;
}

export default function RainbowKitProviderWrapper({ children }: { children: ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

  const { chains, publicClient } = configureChains(
    [monadChain],
    [publicProvider()]
  );

  const { connectors } = getDefaultWallets({
    appName: 'Monad Deathmatch',
    projectId,
    chains,
  });

  const config = createConfig({
    autoConnect: false,
    publicClient,
    connectors,
  });

  return (
    <SafeHydrate>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={config}>
          <RainbowKitProvider chains={chains} modalSize="compact">
            {children}
          </RainbowKitProvider>
        </WagmiConfig>
      </QueryClientProvider>
    </SafeHydrate>
  );
}
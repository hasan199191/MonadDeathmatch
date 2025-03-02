// providers/RainbowKitProvider.tsx
'use client';

import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Monad zincir konfigürasyonu
const monadChain = {
  id: 10143,
  name: 'Monad',
  network: 'monad',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MONAD',
  },
  rpcUrls: {
    public: { http: ['https://rpc.monad.xyz/devnet'] },
    default: { http: ['https://rpc.monad.xyz/devnet'] },
  },
};

const { chains, publicClient } = configureChains(
  [monadChain],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Monad Deathmatch',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
  chains,
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

interface RainbowKitProviderWrapperProps {
  children: React.ReactNode;
}

export default function RainbowKitProviderWrapper({
  children,
}: RainbowKitProviderWrapperProps) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          accentColor: '#8B5CF6',
          borderRadius: 'medium',
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
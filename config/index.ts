import { cookieStorage, createStorage, http } from 'wagmi/core';
import { Chain } from 'wagmi';

export const monadChain: Chain = {
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MONAD',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz/'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz/'],
    },
  },
  blockExplorers: {
    default: { url: 'https://testnet.monadexplorer.com', name: 'Monad Explorer' },
  },
  testnet: true,
};

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error('WalletConnect Project ID eksik!');
}

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
export const networks = [monadChain];

// Wagmi yapılandırması
export const wagmiConfig = {
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
};
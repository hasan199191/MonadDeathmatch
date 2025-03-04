import { Chain } from 'wagmi'

export const monad = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    // Update RPC URLs to correct testnet endpoint
    public: { http: ['https://testnet-rpc.monad.xyz/'] },
    default: { http: ['https://testnet-rpc.monad.xyz/'] },
  },
  blockExplorers: {
    // Update explorer URL
    default: { 
      name: 'MonadExplorer', 
      url: 'https://testnet.monadexplorer.com/' 
    },
  },
} as const satisfies Chain
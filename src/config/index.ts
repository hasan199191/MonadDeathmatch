import { cookieStorage, createStorage } from '@wagmi/core'
import { http } from 'viem'
import { type Chain } from 'viem'

export const monadChain = {
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.monad.xyz/'],
    },
    public: {
      http: ['https://rpc.testnet.monad.xyz/'],
    },
  },
} as const satisfies Chain

export const wagmiConfig = {
  storage: createStorage({
    storage: cookieStorage,
  }),
  transport: http()
}
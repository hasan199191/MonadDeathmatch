import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { monadChain } from './index'

const { chains, publicClient } = configureChains(
  [monadChain],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'Monad Deathmatch',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
  chains,
})

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export { chains }
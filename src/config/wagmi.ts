import { configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { monadChain } from './chains'

const { chains, publicClient } = configureChains(
  [monadChain],
  [publicProvider()]
)

export const config = createConfig({
  autoConnect: true,
  publicClient,
  chains
})

export { chains }
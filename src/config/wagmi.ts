import { configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { monad } from './chains'  // monadChain yerine monad kullan

const { chains, publicClient } = configureChains(
  [monad],  // monadChain yerine monad kullan
  [publicProvider()]
)

const config = createConfig({
  autoConnect: true,
  publicClient,
})

export default config
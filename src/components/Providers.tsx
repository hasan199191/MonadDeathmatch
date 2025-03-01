'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/app/wagmi';
import dynamic from 'next/dynamic';
import { PRIVY_APP_ID } from '@/config/contracts';
import { monadChain } from '@/app/wagmi';

const Sidebar = dynamic(() => import('./Sidebar').then(mod => mod.Sidebar), {
  ssr: false
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 1000,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={PRIVY_APP_ID || ''}
          config={{
            loginMethods: ['wallet', 'email'],
            embeddedWallets: {
              createOnLogin: 'users-without-wallets',
              noPromptOnSignature: true,
            },
            appearance: {
              theme: 'dark',
              accentColor: '#676FFF',
            },
            allowedOrigins: ['http://localhost:3003', 'http://127.0.0.1:3003'],
            walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
            defaultChain: {
              id: monadChain.id,
              name: monadChain.name,
              network: monadChain.network,
              nativeCurrency: monadChain.nativeCurrency,
              rpcUrls: monadChain.rpcUrls,
              blockExplorers: monadChain.blockExplorers,
            },
            supportedChains: [{
              id: monadChain.id,
              name: monadChain.name,
              network: monadChain.network,
              nativeCurrency: monadChain.nativeCurrency,
              rpcUrls: monadChain.rpcUrls,
              blockExplorers: monadChain.blockExplorers,
            }],
          }}
        >
          <div className="flex min-h-screen bg-[#0a0a0a]">
            <div className="fixed top-0 left-0 h-full w-64 bg-[#0a0a0a] border-r border-gray-800">
              <Sidebar />
            </div>
            <main className="flex-1 ml-64">
              <div className="p-4">
                {children}
              </div>
            </main>
          </div>
        </PrivyProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
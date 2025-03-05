'use client';

import { SessionProvider } from 'next-auth/react';
import RainbowKitProviderWrapper from '@/providers/RainbowKitProvider';
import { ReactNode } from 'react';

function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={0}>
      <RainbowKitProviderWrapper>
        {children}
      </RainbowKitProviderWrapper>
    </SessionProvider>
  );
}

export default Providers;
// app/layout.tsx

import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import Providers from '@/components/Providers';
import type { Metadata } from 'next';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Monad Deathmatch',
  description: 'Survival of the fittest in the Monad chain',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className={plusJakartaSans.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
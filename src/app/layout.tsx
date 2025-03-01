"use client";

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from 'next/font/google';
import "./globals.css";
import { ReactNode } from 'react';
import { SessionProvider } from "next-auth/react";
import RainbowKitProviderWrapper from '@/providers/RainbowKitProvider';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });

// metadata kullanımı client componentlerde çalışmaz, bu yüzden kaldırıyoruz
// ve bunları ayrı bir layout-metadata.tsx dosyasında tanımlayabiliriz

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Monad Deathmatch</title>
      </head>
      <body className={plusJakartaSans.className}>
        <RainbowKitProviderWrapper>
          <SessionProvider>
            {children}
          </SessionProvider>
        </RainbowKitProviderWrapper>
      </body>
    </html>
  );
}

"use client";

import { Plus_Jakarta_Sans } from 'next/font/google';
import "./globals.css";
import { ReactNode } from 'react';
import { SessionProvider } from "next-auth/react";
import RainbowKitProviderWrapper from '@/providers/RainbowKitProvider';
import Navbar from '@/components/Navbar'; // Doğru import

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <SessionProvider>
          <RainbowKitProviderWrapper>
            <Navbar /> {/* Navbar bileşeni burada */}
            <main className="pt-16"> {/* Navbar için padding ekleyin */}
              {children}
            </main>
          </RainbowKitProviderWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}

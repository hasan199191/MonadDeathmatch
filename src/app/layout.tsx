"use client";

import { Plus_Jakarta_Sans } from 'next/font/google';
import "./globals.css";
import { ReactNode } from 'react';
import { SessionProvider } from "next-auth/react";
import RainbowKitProviderWrapper from '@/providers/RainbowKitProvider';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const showNavbar = pathname !== '/'; // Landing page'de navbar'ı gizle

  return (
    <html lang="en">
      <body className={`${plusJakartaSans.className} bg-[#0D0D0D] min-h-screen`}>
        <SessionProvider>
          <RainbowKitProviderWrapper>
            {showNavbar && <Navbar />}
            <main className={`${showNavbar ? "pt-16" : ""} text-white`}>
              {children}
            </main>
          </RainbowKitProviderWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
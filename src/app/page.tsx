// app/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { address: wagmiAddress, isConnected } = useAccount();
  const hasRedirected = useRef(false);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cüzdan adresini kaydet
  useEffect(() => {
    if (isConnected && wagmiAddress) {
      localStorage.setItem('walletAddress', wagmiAddress);
      document.cookie = `walletAddress=${wagmiAddress}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, [isConnected, wagmiAddress]);

  // Twitter bağlantısı
  const handleTwitterSignIn = async () => {
    try {
      await signIn('twitter', { 
        callbackUrl: '/', 
        redirect: true 
      });
    } catch (err) {
      console.error('Twitter connection error:', err);
      setError('X connection failed');
    }
  };

  // Yönlendirme kontrolü
  useEffect(() => {
    if (!mounted || status === 'loading' || hasRedirected.current) return;
    
    if (session && isConnected) {
      hasRedirected.current = true;
      router.replace('/home');
    }
  }, [mounted, session, isConnected, status, router]);

  // Durumlar
  const isTwitterConnected = !!session;
  const isWalletConnected = isConnected;

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#0D0D0D]">
      {/* Banner Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/banner.png"
          alt="Monad Deathmatch Banner"
          fill
          priority
          quality={100}
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0D0D]/70 to-[#0D0D0D]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 md:pt-40">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Title and Description */}
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Monad Deathmatch
          </h1>
          <p className="text-xl md:text-2xl text-gray-300">
            Ultimate survival competition on blockchain
          </p>

          {/* Auth Buttons */}
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            {/* Wallet Connect Button */}
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg font-medium transition-colors"
                >
                  {account ? '✓ Wallet Connected' : 'Connect Wallet'}
                </button>
              )}
            </ConnectButton.Custom>

            {/* X Connect Button */}
            <button
              onClick={handleTwitterSignIn}
              disabled={!!session}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                session 
                  ? 'bg-green-600 text-white cursor-not-allowed' 
                  : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
              }`}
            >
              {session ? '✓ X Account Connected' : 'Connect X Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
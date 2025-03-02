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
      {/* Arkaplan */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/banner.png"
          alt="Background"
          fill
          className="object-cover opacity-30"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0D0D]/70 to-[#0D0D0D]" />
      </div>

      {/* Ana İçerik */}
      <div className="relative z-10 container mx-auto px-4 pt-32 md:pt-40">
        <div className="max-w-4xl mx-auto text-center">
          {/* Başlık */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Monad Deathmatch
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            Ultimate survival competition on blockchain
          </p>

          {/* Hata Mesajı */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-100">
              {error}
            </div>
          )}

          {/* Durum Göstergeleri */}
          <div className="flex justify-center gap-4 mb-8">
            <div className={`status-badge ${isTwitterConnected ? 'connected' : ''}`}>
              X Account {isTwitterConnected ? '✓' : '✗'}
            </div>
            <div className={`status-badge ${isWalletConnected ? 'connected' : ''}`}>
              Wallet {isWalletConnected ? '✓' : '✗'}
            </div>
          </div>

          {/* Bağlantı Butonları */}
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto mb-16">
            {/* Cüzdan Butonu */}
            <div className="w-full">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className={`connection-btn ${isWalletConnected ? 'connected' : ''}`}
                  >
                    {isWalletConnected ? 'Wallet Connected' : 'Connect Wallet'}
                  </button>
                )}
              </ConnectButton.Custom>
            </div>

            {/* X Butonu */}
            <button
              onClick={handleTwitterSignIn}
              className={`connection-btn ${isTwitterConnected ? 'connected' : ''}`}
              disabled={isTwitterConnected}
            >
              {isTwitterConnected ? 'X Account Connected' : 'Connect X Account'}
            </button>

            {/* Yönlendirme Mesajı */}
            {!(isTwitterConnected && isWalletConnected) && (
              <div className="text-blue-400 text-sm mt-2">
                {!isTwitterConnected && !isWalletConnected && "Connect both to enter"}
                {isTwitterConnected && !isWalletConnected && "Connect your wallet"}
                {!isTwitterConnected && isWalletConnected && "Connect your X account"}
              </div>
            )}
          </div>

          {/* Özellikler Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="feature-card">
              <h3 className="text-xl font-bold text-white mb-3">Daily Battles</h3>
              <p className="text-gray-400">3 players eliminated every 24 hours</p>
            </div>
            
            <div className="feature-card">
              <h3 className="text-xl font-bold text-white mb-3">Massive Rewards</h3>
              <p className="text-gray-400">50% of total pool to final survivor</p>
            </div>
            
            <div className="feature-card">
              <h3 className="text-xl font-bold text-white mb-3">Live Betting</h3>
              <p className="text-gray-400">Predict outcomes and earn bonuses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
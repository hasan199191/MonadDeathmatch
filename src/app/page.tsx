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

  // Twitter giriş işleyicisi
  const handleTwitterSignIn = async () => {
    try {
      localStorage.removeItem('twitter_connected');
      console.log('Starting Twitter sign in...');
      await signIn('twitter', { 
        callbackUrl: '/', // Ana sayfaya değil, landing page'e dön
        redirect: true
      });
    } catch (err) {
      console.error('Twitter sign in error:', err);
      setError('Failed to connect with Twitter');
    }
  };

  // Ana sayfaya yönlendirme mantığı
  useEffect(() => {
    if (!mounted) return;
    if (status === 'loading') return;
    if (hasRedirected.current) return;

    const isAuthenticated = session && isConnected;

    console.log('Auth Status:', {
      session: !!session,
      isConnected,
      hasRedirected: hasRedirected.current,
      isAuthenticated
    });

    if (isAuthenticated) {
      hasRedirected.current = true;
      console.log('Both accounts verified, redirecting to home...');
      router.replace('/home');
    }
  }, [mounted, isConnected, session, status, router]);

  // Bağlantı durumlarını hesapla
  const isTwitterConnected = !!session;
  const isWalletConnected = isConnected;
  const bothConnected = isTwitterConnected && isWalletConnected;

  // Loading state
  if (!mounted || status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen relative bg-[#0D0D0D]">
      {/* Banner Background */}
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

      <div className="relative z-10 container mx-auto px-4 pt-32 md:pt-40">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Monad Deathmatch
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            Join the ultimate battle for survival and glory
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
              {error}
            </div>
          )}

          {/* Connection Status Banner */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className={`px-3 py-1 rounded-full ${isTwitterConnected 
                ? 'bg-green-500/20 text-green-300 border border-green-500' 
                : 'bg-gray-800 text-gray-400'}`}>
                X Account {isTwitterConnected ? '✓' : ''}
              </div>
              <div className="text-gray-500">+</div>
              <div className={`px-3 py-1 rounded-full ${isWalletConnected 
                ? 'bg-green-500/20 text-green-300 border border-green-500' 
                : 'bg-gray-800 text-gray-400'}`}>
                Wallet {isWalletConnected ? '✓' : ''}
              </div>
            </div>
          </div>

          {/* Connection Buttons */}
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto mb-16">
            {/* Wallet Connect Button */}
            <div className="w-full">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openConnectModal,
                  mounted: rainbowKitMounted,
                }) => {
                  const ready = rainbowKitMounted;
                  
                  return (
                    <div className="w-full">
                      {(() => {
                        if (!ready || !account) {
                          return (
                            <button
                              onClick={openConnectModal}
                              className={`w-full h-[48px] font-bold px-6 rounded-lg transition-all duration-200 flex items-center justify-center
                                ${isWalletConnected 
                                  ? 'bg-green-600/20 border border-green-500 text-white cursor-default' 
                                  : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'}`}
                            >
                              {isWalletConnected ? '✓ Wallet Connected' : 'Connect Wallet'}
                            </button>
                          );
                        }

                        return (
                          <div className="w-full h-[48px] px-6 rounded-lg bg-green-600/20 border border-green-500 text-white font-bold flex items-center justify-center">
                            ✓ Connected: {account.displayName}
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>

            {/* Twitter Connect Button */}
            <button
              onClick={handleTwitterSignIn}
              disabled={isTwitterConnected}
              className={`w-full h-[48px] font-bold px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                ${isTwitterConnected
                  ? 'bg-green-600/20 border border-green-500 text-white cursor-default'
                  : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'}`}
            >
              {isTwitterConnected ? '✓ X Account Connected' : 'Connect X Account'}
            </button>

            {/* Connection Guide Message */}
            {!bothConnected && (
              <div className="text-blue-400 text-sm">
                {!isTwitterConnected && !isWalletConnected && (
                  "Connect both your X account and wallet to continue"
                )}
                {isTwitterConnected && !isWalletConnected && (
                  "Now connect your wallet to continue"
                )}
                {!isTwitterConnected && isWalletConnected && (
                  "Now connect your X account to continue"
                )}
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-2">
                Daily Eliminations
              </h3>
              <p className="text-gray-400">
                3 players eliminated daily until the final survivor emerges
              </p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-2">
                Massive Prize Pool
              </h3>
              <p className="text-gray-400">
                Win up to 50% of the total prize pool as the final survivor
              </p>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-2">
                Place Your Bets
              </h3>
              <p className="text-gray-400">
                Bet on players and earn additional rewards
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
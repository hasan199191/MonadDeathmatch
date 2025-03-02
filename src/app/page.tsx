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

  // Twitter giriş işleyicisi
  const handleTwitterSignIn = async () => {
    try {
      if (!isConnected || !wagmiAddress) {
        setError('Please connect your wallet first');
        return;
      }

      // Wallet adresini localStorage'a kaydet
      localStorage.setItem('walletAddress', wagmiAddress);
      document.cookie = `walletAddress=${wagmiAddress}; path=/; max-age=86400; SameSite=Lax`;

      console.log('Starting Twitter sign in...');
      await signIn('twitter', { 
        callbackUrl: '/home',
        redirect: true
      });
    } catch (err) {
      console.error('Twitter sign in error:', err);
      setError('Failed to connect with Twitter');
    }
  };

  // Yönlendirme mantığı
  useEffect(() => {
    if (status === 'loading') return;
    if (hasRedirected.current) return;

    console.log('Auth Check:', { 
      session: !!session, 
      isConnected, 
      hasRedirected: hasRedirected.current 
    });

    if (session && isConnected) {
      hasRedirected.current = true;
      console.log('Redirecting to home...');
      router.replace('/home');
    }
  }, [isConnected, session, status, router]);

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

      {/* Content */}
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

          {/* Connection Buttons */}
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto mb-16">
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
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                      className="w-full"
                    >
                      {(() => {
                        if (!ready || !account) {
                          return (
                            <button
                              onClick={openConnectModal}
                              className="w-full h-[48px] font-bold px-6 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-all duration-200 flex items-center justify-center"
                            >
                              Connect Wallet
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

            <button
              onClick={handleTwitterSignIn}
              disabled={!isConnected || !!session}
              className={`w-full h-[48px] font-bold px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                ${!isConnected || !!session
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-[#8B5CF6] hover:bg-[#7C3AED]'} text-white`}
            >
              {session ? '✓ Connected with X' : 'Connect with X'}
            </button>

            {/* Status Messages */}
            {!isConnected && (
              <p className="text-blue-400 text-sm">Please connect your wallet first</p>
            )}
            {isConnected && !session && (
              <p className="text-blue-400 text-sm">Now connect your Twitter account</p>
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
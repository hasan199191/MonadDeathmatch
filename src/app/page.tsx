// app/page.tsx
'use client';

import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import type { ExternalProvider } from '@ethersproject/providers';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const { address: wagmiAddress, isConnected } = useAccount();
  const hasRedirected = useRef(false);

  // Mount check
  useEffect(() => {
    setMounted(true);

    // Load saved wallet address from localStorage
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setAddress(savedAddress);
      document.cookie = `walletAddress=${savedAddress}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, []);

  // Track wallet connection status
  useEffect(() => {
    if (!mounted) return;

    if (isConnected && wagmiAddress) {
      setAddress(wagmiAddress);
      localStorage.setItem('walletAddress', wagmiAddress);
      document.cookie = `walletAddress=${wagmiAddress}; path=/; max-age=86400; SameSite=Lax`;
      console.log('Wallet connected through wagmi:', wagmiAddress);
    } else {
      const savedAddress = localStorage.getItem('walletAddress');
      if (savedAddress) {
        setAddress(savedAddress);
        console.log('Using saved wallet address:', savedAddress);
      }
    }
  }, [mounted, isConnected, wagmiAddress]);

  // Redirect logic
  useEffect(() => {
    if (!mounted || status === 'loading' || hasRedirected.current) return;

    console.log('Landing Auth Check:', {
      session: !!session,
      address,
      hasRedirected: hasRedirected.current
    });

    if (session && address) {
      console.log('Both accounts connected, redirecting to /home');
      hasRedirected.current = true;
      router.replace('/home');
    }
  }, [mounted, session, address, status, router]);

  // Handle Twitter sign-in
  const handleTwitterSignIn = async () => {
    try {
      if (address) {
        console.log('Wallet connected, proceeding with Twitter sign-in');
        await signIn('twitter', { callbackUrl: '/home' });
      } else {
        await signIn('twitter', { redirect: true });
      }
    } catch (error) {
      console.error('Twitter sign-in error:', error);
      setError('An error occurred during Twitter sign-in.');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative bg-[#0D0D0D]">
      {/* Banner Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/banner.png"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0D0D0D]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 md:pt-40">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Monad Deathmatch
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            Join the ultimate battle for survival and glory
          </p>

          {/* Connection Buttons */}
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto mb-16">
            {error && (
              <div className="w-full p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
                {error}
              </div>
            )}

            {/* Wallet Connection */}
            <div className="w-full">
              <ConnectButton />
            </div>

            {/* Twitter Sign-In */}
            <button
              onClick={handleTwitterSignIn}
              disabled={!!session}
              className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                ${session 
                  ? 'bg-green-600 text-white cursor-not-allowed opacity-75' 
                  : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'}`}
            >
              {session ? '✓ Connected with X' : 'Connect with X'}
            </button>

            {/* Connection Status Messages */}
            {isConnected && !session && (
              <p className="text-blue-400 text-sm">Please connect your X account to continue</p>
            )}
            {!isConnected && session && (
              <p className="text-blue-400 text-sm">Please connect your wallet to continue</p>
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
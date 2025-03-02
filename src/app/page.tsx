// app/page.tsx
'use client';

import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { address: wagmiAddress, isConnected } = useAccount();
  const hasRedirected = useRef(false);

  // Mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect logic
  useEffect(() => {
    if (!mounted || status === 'loading' || hasRedirected.current) return;

    console.log('Landing Auth Check:', {
      session: !!session,
      isConnected,
      hasRedirected: hasRedirected.current
    });

    if (session && isConnected) {
      console.log('Both accounts connected, redirecting to /home');
      hasRedirected.current = true;
      router.replace('/home');
    }
  }, [mounted, session, isConnected, status, router]);

  const handleTwitterSignIn = async () => {
    try {
      await signIn('twitter', { callbackUrl: '/home' });
    } catch (error) {
      console.error('Twitter sign-in error:', error);
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
            <div className="w-full">
              <ConnectButton />
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
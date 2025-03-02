'use client';

import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ethers } from 'ethers';
import type { ExternalProvider } from '@ethersproject/providers';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Yönlendirme kontrolü için ref - sadece bir kez yönlendirme yapılmasını sağlar
  const hasRedirected = useRef(false);

  // İlk yükleme kontrolü
  useEffect(() => {
    setMounted(true);
    
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setAddress(savedAddress);
      document.cookie = `walletAddress=${savedAddress}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, []);

  // Yönlendirme kontrolü - sadece bir kez çalışacak şekilde
  useEffect(() => {
    // Erken çıkış durumları
    if (!mounted) return;
    if (status === 'loading') return;
    if (hasRedirected.current) return;
    
    console.log('LANDING AUTH CHECK:', {
      session: !!session,
      address,
      hasRedirected: hasRedirected.current
    });
    
    // Her iki hesap da bağlıysa yönlendir ve yönlendirme flag'ini ayarla
    if (session && address) {
      console.log('Both accounts connected, redirecting to /home');
      hasRedirected.current = true;
      router.replace('/home');
    }
  }, [mounted, session, address, status, router]);

  const connectMetaMask = async () => {
    try {
      setIsConnecting(true);
      setError('');

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed!');
      }

      const provider = new ethers.providers.Web3Provider(
        window.ethereum as unknown as ExternalProvider
      );

      const accounts = await provider.send("eth_requestAccounts", []);
      const walletAddress = accounts[0];
      
      setAddress(walletAddress);
      localStorage.setItem('walletAddress', walletAddress);
      document.cookie = `walletAddress=${walletAddress}; path=/; max-age=86400; SameSite=Lax`;
      
      console.log('Wallet connected:', walletAddress);

    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTwitterSignIn = async () => {
    try {
      if (address) {
        console.log('Wallet connected, proceeding with Twitter sign in');
        await signIn("twitter", { 
          callbackUrl: '/home',
          redirect: true 
        });
      } else {
        await signIn("twitter", { redirect: true });
      }
    } catch (error) {
      console.error('Twitter sign in error:', error);
      setError('Twitter bağlantısı sırasında hata oluştu.');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative bg-[#0D0D0D]">
      {/* Banner Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Untitled (Outdoor Banner (72 in x 36 in)) (1).png"
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

          {/* Connection Buttons and Messages */}
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto mb-16">
            {error && (
              <div className="w-full p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
                {error}
              </div>
            )}

            <button
              onClick={connectMetaMask}
              disabled={!!address || isConnecting}
              className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                ${address 
                  ? 'bg-green-600 text-white cursor-not-allowed opacity-75' 
                  : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'}`}
            >
              {isConnecting ? 'Connecting...' : address ? '✓ Wallet Connected' : 'Connect Wallet'}
            </button>

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

            {/* Guidance Messages */}
            {address && !session && (
              <p className="text-blue-400 text-sm">Please connect your X account to continue</p>
            )}
            {!address && session && (
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
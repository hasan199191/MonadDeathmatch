'use client';

import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Her iki hesap da bağlıysa ana sayfaya yönlendir
  useEffect(() => {
    if (isConnected && address && session) {
      router.push('/home');
    }
  }, [isConnected, address, session, router]);

  const handleTwitterSignIn = () => {
    signIn("twitter", { redirect: true });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative bg-[#0D0D0D]">
      {/* Banner Arka Plan */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Untitled (Outdoor Banner (72 in x 36 in)) (1).png"
          alt="Background"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0D0D0D]" />
      </div>

      {/* İçerik */}
      <div className="relative z-10 container mx-auto px-4 pt-32 md:pt-40">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Monad Deathmatch
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            Join the ultimate battle for survival and glory
          </p>

          {/* Bağlantı Butonları ve Mesajlar */}
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto mb-16">
            <div className="w-full">
              <ConnectButton.Custom>
                {({ openConnectModal, mounted: mountedWallet }) => {
                  if (!mountedWallet) return null;
                  return (
                    <button
                      onClick={openConnectModal}
                      disabled={isConnected}
                      className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                        ${isConnected 
                          ? 'bg-green-600 text-white cursor-not-allowed opacity-75' 
                          : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'}`}
                    >
                      {isConnected ? '✓ Wallet Connected' : 'Connect Wallet'}
                    </button>
                  );
                }}
              </ConnectButton.Custom>
            </div>

            <button
              onClick={handleTwitterSignIn}
              disabled={session}
              className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2
                ${session 
                  ? 'bg-green-600 text-white cursor-not-allowed opacity-75' 
                  : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'}`}
            >
              {session ? '✓ X Connected' : 'Connect with X'}
            </button>

            {/* Yönlendirme mesajı */}
            {isConnected && !session && (
              <p className="text-blue-400 text-sm">Please connect your X account to continue</p>
            )}
            {!isConnected && session && (
              <p className="text-blue-400 text-sm">Please connect your wallet to continue</p>
            )}
          </div>

          {/* Özellikler Grid */}
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
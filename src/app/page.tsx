'use client';

import { useEffect, useRef } from 'react';
import { useSession, signIn } from "next-auth/react"; // signIn'i import et
import { useRouter } from "next/navigation";
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { address: wagmiAddress, isConnected } = useAccount();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (hasRedirected.current) return;

    console.log('Landing Auth Check:', {
      session: !!session,
      isConnected,
      hasRedirected: hasRedirected.current
    });

    if (session && isConnected) {
      hasRedirected.current = true;
      console.log('Both accounts connected, redirecting to /home');
      router.replace('/home');
    }
  }, [session, status, isConnected, router]);

  // Twitter sign in handler
  const handleTwitterSignIn = async () => {
    if (wagmiAddress) {
      console.log('Wallet connected, proceeding with Twitter sign in');
      await signIn("twitter", { 
        callbackUrl: '/home'
      });
    } else {
      console.log('Please connect wallet first');
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto space-y-8">
          {/* Wallet Connection */}
          <div className="space-y-4">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openConnectModal,
                mounted
              }) => {
                const ready = mounted;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!ready || !account) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="w-full py-3 px-4 bg-[#8B5CF6] rounded-lg"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      return (
                        <div className="w-full p-4 bg-green-500/20 border border-green-500 rounded-lg">
                          Connected: {account.displayName}
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>

            {/* Twitter Sign In */}
            <button
              onClick={handleTwitterSignIn}
              disabled={!wagmiAddress || !!session}
              className={`w-full py-3 px-4 rounded-lg ${
                !wagmiAddress || !!session
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-[#8B5CF6]'
              }`}
            >
              {session ? '✓ Connected with Twitter' : 'Connect with Twitter'}
            </button>
          </div>

          {/* Status Messages */}
          {wagmiAddress && !session && (
            <p className="text-blue-400 text-center">Now connect your Twitter account</p>
          )}
          {!wagmiAddress && (
            <p className="text-blue-400 text-center">Connect your wallet first</p>
          )}
        </div>
      </div>
    </div>
  );
}
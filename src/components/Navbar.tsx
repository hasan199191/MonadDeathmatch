import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useSession } from 'next-auth/react';

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { address: wagmiAddress, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }

    // LocalStorage'dan cüzdan adresini al
    const savedAddress = localStorage.getItem('walletAddress');
    
    // Eğer wallet bağlıysa güncelle
    if (isConnected && wagmiAddress) {
      setAddress(wagmiAddress);
      localStorage.setItem('walletAddress', wagmiAddress);
      document.cookie = `walletAddress=${wagmiAddress}; path=/; max-age=86400; SameSite=Lax`;
    }
    // Değilse kayıtlı adresi kullan
    else if (savedAddress) {
      setAddress(savedAddress);
    }
  }, [mounted, isConnected, wagmiAddress]);

  // Sayfa yüklenmeden gösterme
  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-sm border-b border-[#262626]">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo ve Menü */}
          <div className="flex items-center gap-8">
            <Link href="/home" className="text-[#8B5CF6] font-bold text-xl">
              Monad Deathmatch
            </Link>
            <div className="flex items-center gap-6">
              <Link 
                href="/home" 
                className={`navbar-link ${pathname === '/home' ? 'navbar-link-active' : ''}`}
              >
                Home
              </Link>
              <Link 
                href="/rules" 
                className={`navbar-link ${pathname === '/rules' ? 'navbar-link-active' : ''}`}
              >
                Rules
              </Link>
            </div>
          </div>
          
          {/* Cüzdan Durumu */}
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="px-4 py-2 bg-[#8B5CF6]/20 border border-[#8B5CF6] rounded-lg text-white">
                {wagmiAddress?.slice(0, 6)}...{wagmiAddress?.slice(-4)}
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
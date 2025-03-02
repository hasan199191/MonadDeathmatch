import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';

export const Navbar = () => {
  const pathname = usePathname();
  const { address: wagmiAddress, isConnected } = useAccount();
  const [address, setAddress] = useState('');
  const [mounted, setMounted] = useState(false);

  // Sayfa yüklendiğinde ve wallet durumu değiştiğinde çalışacak useEffect
  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }
    
    // LocalStorage'dan wallet kontrolü
    const savedAddress = localStorage.getItem('walletAddress');
    
    // Ya wagmi'nin bağlı olduğu adresi ya da localStorage'daki adresi kullan
    if (isConnected && wagmiAddress) {
      setAddress(wagmiAddress);
      
      // localStorage'ı güncelle
      localStorage.setItem('walletAddress', wagmiAddress);
      
      // Cookie'yi güncelle
      document.cookie = `walletAddress=${wagmiAddress}; path=/; max-age=86400; SameSite=Lax`;
      
      console.log('Wallet connected in Navbar:', wagmiAddress);
    } else if (savedAddress) {
      setAddress(savedAddress);
      console.log('Using saved wallet address in Navbar:', savedAddress);
    }
  }, [isConnected, wagmiAddress, mounted]);

  // Sayfa yüklenmeden bir şey gösterme
  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-sm border-b border-[#262626]">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo ve menüler */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-[#8B5CF6] font-bold text-xl">
              Monad Deathmatch
            </Link>
            {/* ...diğer menü öğeleri... */}
          </div>
          
          {/* Connect Wallet Button */}
          <div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
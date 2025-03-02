import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export const Navbar = () => {
  const pathname = usePathname();
  const { address: wagmiAddress, isConnected } = useAccount();
  const [address, setAddress] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // LocalStorage'dan wallet kontrolü
    const savedAddress = localStorage.getItem('walletAddress');
    
    if (isConnected && wagmiAddress) {
      setAddress(wagmiAddress);
      localStorage.setItem('walletAddress', wagmiAddress);
      document.cookie = `walletAddress=${wagmiAddress}; path=/; max-age=86400; SameSite=Lax`;
    } else if (savedAddress) {
      setAddress(savedAddress);
    }
  }, [isConnected, wagmiAddress]);

  // Debug amaçlı
  console.log('Navbar render:', { 
    pathname, 
    mounted, 
    isConnected, 
    wagmiAddress,
    savedAddress: localStorage.getItem('walletAddress')
  });

  // Sayfa yüklenmeden içeriği gösterme
  if (!mounted) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-sm border-b border-[#262626]">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-[#8B5CF6] font-bold text-xl">
              Monad Deathmatch
            </Link>
            
            {/* Menü linkleri - Z-INDEX ve POINTER-EVENTS eklendi */}
            <div className="relative z-50 hidden md:flex items-center gap-6 pointer-events-auto">
              <Link 
                href="/home" 
                className={pathname === '/home' ? 'text-[#8B5CF6]' : 'text-gray-300 hover:text-[#8B5CF6]'}
              >
                Home
              </Link>
              <Link 
                href="/rules" 
                className={pathname === '/rules' ? 'text-[#8B5CF6]' : 'text-gray-300 hover:text-[#8B5CF6]'}
              >
                Rules
              </Link>
            </div>
          </div>
          
          {/* Cüzdan bağlantı butonu */}
          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
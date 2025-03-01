import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-sm border-b border-[#262626]">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo ve menü */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-[#8B5CF6] font-bold text-xl">
              Monad Deathmatch
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/home" 
                className={`text-gray-300 hover:text-[#8B5CF6] transition-colors ${
                  pathname === '/home' 
                    ? 'text-[#8B5CF6]' 
                    : 'text-gray-300 hover:text-[#8B5CF6]'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/rules" 
                className={`text-gray-300 hover:text-[#8B5CF6] transition-colors ${
                  pathname === '/rules' 
                    ? 'text-[#8B5CF6]' 
                    : 'text-gray-300 hover:text-[#8B5CF6]'
                }`}
              >
                Rules
              </Link>
            </div>
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
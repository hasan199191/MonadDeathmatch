'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { InjectedConnector } from 'wagmi/connectors/injected';

export default function ConnectPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const { data: session } = useSession();
  const [status, setStatus] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug log ekleyelim
  useEffect(() => {
    if (mounted) {
      console.log('Bağlantı Durumu:', {
        wallet: { address, isConnected },
        twitter: session?.user
      });
    }
  }, [mounted, address, isConnected, session]);

  const saveConnections = async () => {
    if (!address || !session?.user?.name) {
      setStatus('❌ Lütfen hem cüzdan hem de Twitter hesabını bağlayın');
      return;
    }

    try {
      console.log('Bağlantı kaydediliyor...', {
        wallet: address,
        twitter: session.user.name
      });

      const response = await fetch('/api/user/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          twitterUsername: session.user.name,
          twitterId: session.user.id,
          twitterProfileImage: session.user.image
        })
      });

      const data = await response.json();
      console.log('Sunucu yanıtı:', data);
      
      if (data.success) {
        setStatus('✅ Bağlantılar başarıyla kaydedildi!');
      } else {
        setStatus('❌ ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      setStatus('❌ Bağlantı hatası oluştu');
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#0D0D0D] text-white p-8">
      <div className="max-w-md mx-auto">
        <p>Yükleniyor...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-8">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Hesap Bağlantıları</h1>

        {/* Cüzdan Durumu */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Cüzdan Durumu</h2>
          {isConnected ? (
            <div className="flex items-center justify-between">
              <p className="text-green-400">✓ {address?.slice(0, 6)}...{address?.slice(-4)}</p>
              <button 
                onClick={() => disconnect()}
                className="text-sm text-red-400"
              >
                Bağlantıyı Kes
              </button>
            </div>
          ) : (
            <button 
              onClick={() => connect()}
              className="w-full bg-blue-500 p-2 rounded"
            >
              Cüzdan Bağla
            </button>
          )}
        </div>

        {/* Twitter Durumu */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Twitter Durumu</h2>
          {session ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || ''} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <p className="text-green-400">✓ @{session.user?.name}</p>
              </div>
              <button 
                onClick={() => signOut()}
                className="text-sm text-red-400"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signIn('twitter')}
              className="w-full bg-blue-500 p-2 rounded"
            >
              Twitter ile Giriş Yap
            </button>
          )}
        </div>

        {/* Kaydet Butonu */}
        <button 
          onClick={saveConnections}
          disabled={!isConnected || !session}
          className={`w-full p-3 rounded-lg ${
            isConnected && session 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          Bağlantıları Kaydet
        </button>

        {/* Durum Mesajı */}
        {status && (
          <div className={`p-4 rounded-lg ${
            status.includes('✅') ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
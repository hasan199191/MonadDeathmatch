'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { useState, useEffect } from 'react';

export default function WalletTestPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const saveWallet = async () => {
    if (!address) return;

    try {
      const response = await fetch('/api/wallet/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address })
      });

      const data = await response.json();
      setStatus(data.success ? '✅ Cüzdan kaydedildi!' : '❌ ' + data.error);
    } catch (error) {
      setStatus('❌ Kayıt hatası!');
      console.error('Kayıt hatası:', error);
    }
  };

  useEffect(() => {
    if (mounted) {
      console.log('Cüzdan Durumu:', {
        address,
        isConnected
      });
    }
  }, [mounted, address, isConnected]);

  if (!mounted) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-8">Cüzdan Test</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="mb-4">
            <p className="text-gray-400 mb-2">Durum:</p>
            <p className={isConnected ? "text-green-400" : "text-red-400"}>
              {isConnected ? "✅ Bağlı" : "❌ Bağlı Değil"}
            </p>
          </div>

          {address && (
            <div className="mb-4">
              <p className="text-gray-400 mb-2">Cüzdan Adresi:</p>
              <p className="font-mono bg-gray-900 p-2 rounded">
                {address}
              </p>
            </div>
          )}

          <button 
            onClick={() => isConnected ? disconnect() : connect()}
            className={`w-full p-3 rounded-lg ${
              isConnected 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isConnected ? 'Bağlantıyı Kes' : 'Cüzdan Bağla'}
          </button>

          {isConnected && (
            <button 
              onClick={saveWallet}
              className="w-full mt-4 p-3 bg-green-500 hover:bg-green-600 rounded-lg"
            >
              Cüzdanı Kaydet
            </button>
          )}

          {status && (
            <div className="mt-4 p-4 rounded-lg bg-gray-800">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';

interface WalletUser {
  id: string;
  walletAddress: string;
  createdAt: string;
}

export default function WalletListPage() {
  const [users, setUsers] = useState<WalletUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/list')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users);
        setLoading(false);
      })
      .catch(err => {
        console.error('Veri yükleme hatası:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Kayıtlı Cüzdanlar</h1>
        
        {loading ? (
          <p>Yükleniyor...</p>
        ) : (
          <div className="grid gap-4">
            {users.map(user => (
              <div 
                key={user.id} 
                className="bg-gray-800 p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-mono">
                    {user.walletAddress}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                <a 
                  href={`https://etherscan.io/address/${user.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Etherscan'de Görüntüle
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
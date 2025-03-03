'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  wallet_address: string;
  twitter_username: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/test-db')
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
        <h1 className="text-2xl font-bold mb-8">Kayıtlı Kullanıcılar</h1>
        
        {loading ? (
          <p>Yükleniyor...</p>
        ) : (
          <div className="grid gap-4">
            {users.map(user => (
              <div 
                key={user.id}
                className="bg-gray-800 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-mono text-blue-400">
                      {user.wallet_address}
                    </p>
                    {user.twitter_username && (
                      <p className="text-gray-400">
                        Twitter: {user.twitter_username}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
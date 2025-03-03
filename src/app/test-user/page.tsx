'use client';

import { useState } from 'react';

export default function TestUserPage() {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/test-user', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: formData.get('wallet'),
          twitterUsername: formData.get('twitter')
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setMessage(data.success ? 'Kullanıcı eklendi ✅' : 'Hata: ' + data.error);
    } catch (error) {
      setMessage('İşlem başarısız ❌');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Kullanıcı Ekle</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cüzdan Adresi</label>
          <input 
            name="wallet"
            className="w-full p-2 border rounded"
            placeholder="0x..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Twitter Kullanıcı Adı</label>
          <input 
            name="twitter"
            className="w-full p-2 border rounded"
            placeholder="@kullaniciadi"
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Ekle
        </button>
      </form>

      {message && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          {message}
        </div>
      )}
    </div>
  );
}
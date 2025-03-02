'use client';

import { useState } from 'react';

export default function TestPage() {
  const [message, setMessage] = useState('');

  async function create(formData: FormData) {
    try {
      const response = await fetch('/api/neon-test', {
        method: 'POST',
        body: JSON.stringify({
          comment: formData.get('comment')
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Yorum başarıyla eklendi ✅');
      } else {
        setMessage('Hata: ' + data.error);
      }
    } catch (error) {
      setMessage('Bir hata oluştu ❌');
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Neon Veritabanı Testi</h1>
        
        <form action={create} className="space-y-4">
          <input 
            type="text" 
            name="comment" 
            placeholder="Test yorumu yazın..."
            className="w-full p-2 bg-gray-800 rounded border border-gray-700"
          />
          <button 
            type="submit"
            className="w-full p-2 bg-purple-600 rounded hover:bg-purple-700"
          >
            Gönder
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-gray-800 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
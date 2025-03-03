'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  
  const testConnection = async () => {
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Hata: ' + error);
    }
  };

  return (
    <div className="p-8">
      <button 
        onClick={testConnection}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Bağlantıyı Test Et
      </button>
      
      {result && (
        <pre className="mt-4 p-4 bg-gray-800 text-white rounded">
          {result}
        </pre>
      )}
    </div>
  );
}
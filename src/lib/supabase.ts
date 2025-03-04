import { createClient } from '@supabase/supabase-js';

// Vercel ortamında olduğumuzu tespit et
const isVercel = process.env.VERCEL === '1';
const vercelEnv = process.env.VERCEL_ENV;

// Supabase değişkenlerini al
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Hangi anahtarın kullanılacağını belirle (server tarafında service key, client tarafında anon key)
const isServer = typeof window === 'undefined';
const supabaseKey = isServer ? supabaseServiceKey : supabaseAnonKey;

// Debug bilgilerini yazdır
if (isVercel) {
  console.log(`Vercel ortamı: ${vercelEnv}`);
  console.log(`Supabase URL: ${supabaseUrl.slice(0, 10)}...`);
  console.log(`Anahtar kullanılabilir: ${!!supabaseKey}`);
  console.log(`Server tarafında: ${isServer}`);
}

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false // Vercel'de session persistence sorunlarını önlemek için
  }
});

// Client tarafında kullanım için ayrı bir istemci
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
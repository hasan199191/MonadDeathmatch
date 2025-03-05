import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase environment variables eksik');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Bağlantı testi fonksiyonunu güncelleyelim
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Supabase bağlantı hatası:', error);
      return false;
    }
    
    console.log('Supabase bağlantı başarılı:', data);
    return true;
  } catch (error) {
    console.error('Supabase bağlantı testi sırasında hata:', error);
    return false;
  }
};

// Cache'i kontrol eden yardımcı fonksiyon
export const clearSupabaseCache = () => {
  // Local storage'dan Supabase ile ilgili verileri temizle
  if (typeof window !== 'undefined') {
    Object.keys(localStorage)
      .filter(key => key.startsWith('sb-'))
      .forEach(key => localStorage.removeItem(key));
  }
};
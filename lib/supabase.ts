import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Bağlantı testi
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('participants').select('*').limit(1);
    if (error) {
      console.error('Bağlantı hatası:', error);
      return false;
    }
    console.log('Bağlantı başarılı:', data);
    return true;
  } catch (error) {
    console.error('Bağlantı testi sırasında hata:', error);
    return false;
  }
};
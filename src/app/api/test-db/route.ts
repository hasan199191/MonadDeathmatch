import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      users: data,
      message: 'Kullanıcı verileri başarıyla getirildi ✅'
    });
  } catch (error) {
    console.error('Veri getirme hatası:', error);
    return NextResponse.json({ 
      error: String(error),
      message: 'Veri getirme hatası ❌' 
    }, { status: 500 });
  }
}
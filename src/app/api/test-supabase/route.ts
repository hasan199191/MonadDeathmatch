import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Verileri getirmeyi dene
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .limit(5);
    
    // ENV değişkenlerinin varlığını kontrol et (güvenlik için değerleri değil, sadece var mı yok mu)
    const envCheck = {
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };
    
    if (error) {
      console.error('Supabase hatası:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        envCheck,
        message: 'Supabase bağlantısı başarısız'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase bağlantısı başarılı',
      data: data || [],
      count: data?.length || 0,
      envCheck
    });
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      error: 'API işlemi başarısız oldu'
    }, { status: 500 });
  }
}
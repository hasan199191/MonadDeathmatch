import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // @/src/lib yerine @/lib kullanın

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*');
    
    if (error) {
      console.error('Debug sorgusu hatası:', error);
      return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }

    console.log('Mevcut eşleştirmeler:', data);
    
    return NextResponse.json({
      count: data.length,
      mappings: data
    });
  } catch (error) {
    console.error('Debug endpoint hatası:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
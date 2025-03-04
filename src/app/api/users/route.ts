import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Prisma yerine Supabase kullan

export async function GET() {
  try {
    // Prisma yerine Supabase ile kullanıcıları getir
    const { data, error } = await supabase
      .from('participants')
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
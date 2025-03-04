import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Prisma yerine Supabase client'ı kullanın

export async function POST(req: Request) {
  try {
    const { walletAddress, twitterId } = await req.json();
    
    // Prisma yerine Supabase ile kullanıcıyı bağla
    const { data, error } = await supabase
      .from('participants')
      .upsert({
        wallet_address: walletAddress,
        twitter_id: twitterId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'wallet_address'
      });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to connect accounts' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
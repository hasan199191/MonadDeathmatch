import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// İstek tipi tanımı
interface ConnectRequest {
  walletAddress: string;
  twitterId: string;
}

export async function POST(req: Request) {
  try {
    // Tip ataması (type assertion) ile güvenli dönüşüm
    const { walletAddress, twitterId } = await req.json() as ConnectRequest;
    
    // Paremetre kontrolü
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Supabase ile kullanıcı bağlantısı
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
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// İstek tipi tanımı
interface ConnectRequest {
  walletAddress: string;
  twitterId: string;
}

export async function POST(req: Request) {
  try {
    const { walletAddress } = await req.json();
    const token = await getToken({ req });
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Önce eski kaydı temizleyelim
    const { error: deleteError } = await supabase
      .from('participants')
      .delete()
      .eq('wallet_address', walletAddress.toLowerCase());

    if (deleteError) {
      console.error('Eski kayıt silme hatası:', deleteError);
    }

    // Yeni kaydı ekleyelim
    const { data, error } = await supabase
      .from('participants')
      .insert([
        {
          wallet_address: walletAddress.toLowerCase(),
          twitter_id: token.sub,
          twitter_username: token.username,
          profile_image_url: token.picture,
          last_connected: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Supabase hatası:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Debug için log
    console.log('Yeni bağlantı kaydı:', {
      wallet: walletAddress,
      twitter: token,
      result: data
    });

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
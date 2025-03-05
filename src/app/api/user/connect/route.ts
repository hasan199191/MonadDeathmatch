import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { supabase } from "@/lib/supabase";

interface TwitterUser {
  sub: string;      // Twitter ID
  name: string;     // Twitter kullanıcı adı
  picture: string;  // Profil resmi URL'i
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    }) as TwitterUser | null;
    
    if (!token) {
      return NextResponse.json({ error: 'Twitter kimlik doğrulama başarısız' }, { status: 401 });
    }

    // Önce eski kaydı kontrol et ve güncelle
    const { data: existingUser, error: fetchError } = await supabase
      .from('participants')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (existingUser) {
      // Kullanıcı varsa güncelle
      const { error: updateError } = await supabase
        .from('participants')
        .update({
          twitter_id: token.sub,
          twitter_username: token.name,
          twitter_profile_image: token.picture,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress.toLowerCase());

      if (updateError) {
        console.error('Güncelleme hatası:', updateError);
        return NextResponse.json({ error: 'Güncelleme başarısız' }, { status: 500 });
      }
    } else {
      // Yeni kullanıcı ekle
      const { error: insertError } = await supabase
        .from('participants')
        .insert([{
          wallet_address: walletAddress.toLowerCase(),
          twitter_id: token.sub,
          twitter_username: token.name,
          twitter_profile_image: token.picture
        }]);

      if (insertError) {
        console.error('Ekleme hatası:', insertError);
        return NextResponse.json({ error: 'Kayıt başarısız' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Twitter hesabı başarıyla bağlandı' 
    });

  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import sql from '../../../../../lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const { walletAddress } = await request.json();
    
    // Kullanıcıyı güncelle veya oluştur
    const user = await sql`
      INSERT INTO users (
        "walletAddress",
        "twitterUsername",
        "twitterId",
        "twitterProfileImage",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${walletAddress},
        ${session.user?.name},
        ${session.user?.id},
        ${session.user?.image},
        NOW(),
        NOW()
      )
      ON CONFLICT ("twitterId") DO UPDATE SET
        "walletAddress" = ${walletAddress},
        "twitterUsername" = ${session.user?.name},
        "twitterProfileImage" = ${session.user?.image},
        "updatedAt" = NOW()
      RETURNING *;
    `;

    return NextResponse.json({ success: true, user: user[0] });
  } catch (error) {
    console.error('Bağlantı hatası:', error);
    return NextResponse.json(
      { error: 'İşlem başarısız oldu' },
      { status: 500 }
    );
  }
}
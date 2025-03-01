import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { walletAddress, twitterUsername, profileImageUrl } = await req.json();

    // Kullanıcı kaydını kontrol et ve güncelle/oluştur
    const user = await prisma.user.upsert({
      where: {
        walletAddress: walletAddress,
      },
      update: {
        twitterUsername,
        profileImageUrl,
      },
      create: {
        walletAddress,
        twitterUsername,
        profileImageUrl,
      },
    });

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Twitter bağlantı hatası:', error);
    return NextResponse.json(
      { error: 'Twitter bağlantısı başarısız' }, 
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import prisma from 'lib/prisma';

export async function GET() {
  try {
    // Mock veriler yerine gerçek veritabanı sorgusu
    const users = await prisma.user.findMany({
      select: {
        id: true,
        walletAddress: true,
        twitterUsername: true,
        profileImageUrl: true,
        createdAt: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Kullanıcı verileri getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Kullanıcı verileri alınamadı' },
      { status: 500 }
    );
  }
}
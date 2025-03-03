import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { walletAddress, twitterUsername } = await request.json();

    const user = await prisma.user.create({
      data: {
        walletAddress,
        twitterUsername,
        twitterProfileImage: `https://unavatar.io/twitter/${twitterUsername}`,
      }
    });

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Kullanıcı ekleme hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Kullanıcı eklenemedi'
    }, { status: 500 });
  }
}
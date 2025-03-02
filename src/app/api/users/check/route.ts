import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        walletAddress: true,
        twitterUsername: true,
        twitterProfileImage: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Veri getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar getirilemedi' },
      { status: 500 }
    );
  }
}
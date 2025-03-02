import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { walletAddress: { not: null } },
          { twitterUsername: { not: null } }
        ]
      },
      select: {
        walletAddress: true,
        twitterUsername: true,
        twitterProfileImage: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const stats = {
      totalParticipants: users.length,
      participants: users
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'İstatistikler getirilemedi' }, 
      { status: 500 }
    );
  }
}

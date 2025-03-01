import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log("Kullanıcılar getiriliyor...");
    const users = await prisma.user.findMany({
      select: {
        walletAddress: true,
        twitterId: true,
        twitterUsername: true,
        profileImageUrl: true
      }
    });
    
    console.log(`${users.length} kullanıcı bulundu:`, users);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
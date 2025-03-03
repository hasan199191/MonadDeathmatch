import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        walletAddress: {
          not: null
        }
      },
      select: {
        id: true,
        walletAddress: true,
        createdAt: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      count: users.length,
      users 
    });

  } catch (error) {
    console.error('Veritabanı hatası:', error);
    return NextResponse.json({ error: 'Veri getirilemedi' }, { status: 500 });
  }
}
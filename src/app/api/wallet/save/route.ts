import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cüzdan adresi gerekli' 
      }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: {
        walletAddress,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Cüzdan kaydedildi ✅',
      user 
    });

  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Kayıt başarısız' 
    }, { status: 500 });
  }
}
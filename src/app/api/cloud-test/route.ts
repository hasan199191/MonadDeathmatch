import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Bağlantıyı test et
    const timestamp = await prisma.$queryRaw`SELECT NOW()`;
    
    // Test kullanıcısı oluştur
    const user = await prisma.user.create({
      data: {
        walletAddress: `0xtest${Date.now()}`
      }
    });

    return NextResponse.json({
      success: true,
      timestamp,
      testUser: user,
      message: 'Prisma Cloud bağlantısı başarılı ✅'
    });

  } catch (error) {
    console.error('Test hatası:', error);
    return NextResponse.json({ 
      error: String(error) 
    }, { status: 500 });
  }
}
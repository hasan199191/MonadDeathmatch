import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Basit bir sorgu deneyelim
    const now = await prisma.$queryRaw`SELECT NOW()`;
    
    return NextResponse.json({
      success: true,
      timestamp: now,
      message: 'Bağlantı başarılı! ✅'
    });
  } catch (error) {
    console.error('Bağlantı hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Bağlantı hatası ❌'
    }, { status: 500 });
  }
}
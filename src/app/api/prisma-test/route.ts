import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const count = await prisma.user.count();
    
    return NextResponse.json({ 
      success: true,
      message: 'Prisma bağlantısı başarılı ✅',
      userCount: count 
    });
  } catch (error) {
    console.error('Prisma hatası:', error);
    return NextResponse.json(
      { error: 'Veritabanı bağlantı hatası' },
      { status: 500 }
    );
  }
}
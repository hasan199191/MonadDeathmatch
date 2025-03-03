import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const timestamp = await prisma.$queryRaw`SELECT NOW()`;
    return NextResponse.json({ 
      success: true,
      timestamp,
      message: 'Prisma Accelerate bağlantısı başarılı ✅'
    });
  } catch (error) {
    console.error('Bağlantı hatası:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Test verisi ekle
    const user = await prisma.user.create({
      data: {
        walletAddress: `0xtest${Date.now()}`,
      }
    });

    // Tüm verileri getir
    const allUsers = await prisma.user.findMany();

    return NextResponse.json({
      success: true,
      testUser: user,
      allUsers,
      count: allUsers.length
    });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    return NextResponse.json({ 
      success: true, 
      timestamp: result[0].now,
      message: 'Bağlantı başarılı ✅' 
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
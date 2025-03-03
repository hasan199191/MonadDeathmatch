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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return new NextResponse(JSON.stringify({
      success: true,
      count: users.length,
      users: users
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Veri getirme hatası'
    }, { status: 500 });
  }
}
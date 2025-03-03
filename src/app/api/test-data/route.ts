import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  try {
    const user = await prisma.user.create({
      data: {
        walletAddress: '0xtest' + Date.now(),
      }
    });

    return NextResponse.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
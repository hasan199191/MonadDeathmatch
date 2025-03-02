import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { monad } from '@/config/chains';
import { MONAD_DEATHMATCH_ABI, MONAD_DEATHMATCH_ADDRESS } from '@/config/contracts';
import prisma from 'lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Katılımcı verilerini getirirken hata:', error);
    return NextResponse.json(
      { error: 'Katılımcı verileri alınamadı' },
      { status: 500 }
    );
  }
}

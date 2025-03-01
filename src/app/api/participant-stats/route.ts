import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { monad } from '@/config/chains';
import { MONAD_DEATHMATCH_ABI, MONAD_DEATHMATCH_ADDRESS } from '@/config/contracts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get('poolId');

    if (!poolId) {
      return NextResponse.json(
        { error: 'Pool ID gerekli' },
        { status: 400 }
      );
    }

    const client = createPublicClient({
      chain: monad,
      transport: http()
    });

    // Sadece poolId parametresi gönderiyoruz
    const participants = await client.readContract({
      address: MONAD_DEATHMATCH_ADDRESS,
      abi: MONAD_DEATHMATCH_ABI,
      functionName: 'getParticipants',
      args: [BigInt(poolId)], // Tek parametre
    });

    return NextResponse.json({ participants });
  } catch (error) {
    console.error('Katılımcı verileri alınamadı:', error);
    return NextResponse.json(
      { error: 'Katılımcı verileri alınamadı' },
      { status: 500 }
    );
  }
}

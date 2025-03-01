import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { monad } from '@/config/chains';
import { MONAD_DEATHMATCH_ABI, MONAD_DEATHMATCH_ADDRESS } from '@/config/contracts';

export async function GET(request: NextRequest) {
  const client = createPublicClient({
    chain: monad,
    transport: http(),
  });

  const searchParams = request.nextUrl.searchParams;
  const poolId = searchParams.get('poolId');
  const address = searchParams.get('address');

  if (!poolId || !address) {
    return NextResponse.json(
      { error: 'Missing poolId or address' },
      { status: 400 }
    );
  }

  try {
    const stats = await client.readContract({
      address: MONAD_DEATHMATCH_ADDRESS,
      abi: MONAD_DEATHMATCH_ABI,
      functionName: 'getParticipantStats',
      args: [BigInt(poolId), address],
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching participant stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participant stats' },
      { status: 500 }
    );
  }
}

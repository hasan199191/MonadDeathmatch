import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", JSON.stringify(session?.user, null, 2));
    
    if (!session || !session.user) {
      console.log("Oturum yok veya kullanıcı bilgisi eksik");
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }
    
    const body = await request.json();
    const { walletAddress } = body;
    console.log("İstek verileri:", { walletAddress, twitterUser: session.user });
    
    if (!walletAddress) {
      console.log("Cüzdan adresi eksik");
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {
        twitterId: session.user.id || '',
        twitterUsername: session.user.name || '',
        profileImageUrl: session.user.image || ''
      },
      create: {
        walletAddress,
        twitterId: session.user.id || '',
        twitterUsername: session.user.name || '',
        profileImageUrl: session.user.image || ''
      }
    });
    
    console.log("Kaydedilen kullanıcı:", user);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json({ 
      error: 'Failed to connect account', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
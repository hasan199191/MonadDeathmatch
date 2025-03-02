import { NextResponse } from 'next/server';
import sql from '../../../../lib/database';

export async function GET() {
  try {
    // Tüm kullanıcıları getir
    const users = await sql`
      SELECT 
        "walletAddress",
        "twitterUsername",
        "twitterProfileImage",
        "createdAt"
      FROM users
      WHERE "walletAddress" IS NOT NULL 
        AND "twitterUsername" IS NOT NULL
      ORDER BY "createdAt" DESC;
    `;
    
    return NextResponse.json({ 
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Kullanıcı verisi alınamadı:', error);
    return NextResponse.json(
      { error: 'Kullanıcı verisi alınamadı' },
      { status: 500 }
    );
  }
}
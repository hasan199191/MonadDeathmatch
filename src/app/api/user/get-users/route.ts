import { NextResponse } from 'next/server';
import sql from '../../../../../lib/database';

export async function GET() {
  try {
    const users = await sql`
      SELECT 
        "walletAddress",
        "twitterUsername",
        "twitterProfileImage",
        "createdAt"
      FROM users
      WHERE 
        "walletAddress" IS NOT NULL AND 
        "twitterUsername" IS NOT NULL
      ORDER BY "createdAt" DESC;
    `;

    return NextResponse.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Veri getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcılar getirilemedi' },
      { status: 500 }
    );
  }
}
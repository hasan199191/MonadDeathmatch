import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { comment } = await request.json();

    // Yorumu veritabanına ekle
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Neon DB hatası:', error);
    return NextResponse.json(
      { error: 'Veritabanı hatası' },
      { status: 500 }
    );
  }
}
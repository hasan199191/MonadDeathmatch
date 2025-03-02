import { NextResponse } from 'next/server';
import sql from '../../../../lib/database';  // Yolu düzelttik

export async function GET() {
  try {
    const result = await sql`SELECT NOW() as time;`;
    
    return NextResponse.json({ 
      success: true, 
      time: result[0].time,
      message: 'Neon bağlantısı başarılı ✅' 
    });
  } catch (error) {
    console.error('Neon DB hatası:', error);
    return NextResponse.json(
      { error: 'Veritabanı bağlantı hatası ❌' },
      { status: 500 }
    );
  }
}
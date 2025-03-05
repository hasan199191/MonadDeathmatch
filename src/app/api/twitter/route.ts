import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'  // Import yolunu düzelttik

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  return NextResponse.json({
    authenticated: true,
    user: session.user
  })
}
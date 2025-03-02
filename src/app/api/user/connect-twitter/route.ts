import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "lib/auth"  // Doğru import yolu
import { prisma } from "lib/prisma"  // Doğru import yolu

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { walletAddress, twitterUsername, profileImageUrl } = await req.json()

    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: { twitterUsername, profileImageUrl },
      create: { walletAddress, twitterUsername, profileImageUrl }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Twitter bağlantı hatası:', error)
    return NextResponse.json(
      { error: 'Twitter bağlantısı başarısız' }, 
      { status: 500 }
    )
  }
}
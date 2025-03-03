import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { walletAddress, twitterUsername, twitterId, twitterProfileImage } = await request.json();

    // Gerekli alanları kontrol et
    if (!walletAddress || !twitterUsername) {
      return NextResponse.json({
        success: false,
        error: 'Cüzdan adresi ve Twitter kullanıcı adı gerekli'
      }, { status: 400 });
    }

    // Kullanıcıyı oluştur veya güncelle
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {
        twitterUsername,
        twitterId,
        twitterProfileImage,
        updatedAt: new Date()
      },
      create: {
        walletAddress,
        twitterUsername,
        twitterId,
        twitterProfileImage
      }
    });

    console.log('Kullanıcı kaydedildi:', user);

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Veritabanı hatası:', error);
    return NextResponse.json({
      success: false,
      error: 'Kullanıcı kaydedilemedi'
    }, { status: 500 });
  }
}
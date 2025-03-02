import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Test kullanıcısı 1
  const user1 = await prisma.user.upsert({
    where: { walletAddress: '0x1234567890abcdef' },
    update: {},
    create: {
      walletAddress: '0x1234567890abcdef',
      twitterUsername: 'test_user1',
      twitterId: '123456789',
      twitterProfileImage: 'https://pbs.twimg.com/profile_images/default1.png'
    }
  })

  // Test kullanıcısı 2
  const user2 = await prisma.user.upsert({
    where: { walletAddress: '0xabcdef1234567890' },
    update: {},
    create: {
      walletAddress: '0xabcdef1234567890',
      twitterUsername: 'test_user2',
      twitterId: '987654321',
      twitterProfileImage: 'https://pbs.twimg.com/profile_images/default2.png'
    }
  })

  console.log('Seed tamamlandı ✅')
  console.log('Kullanıcı 1:', user1)
  console.log('Kullanıcı 2:', user2)
}

main()
  .catch((e) => {
    console.error('Seed hatası ❌:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
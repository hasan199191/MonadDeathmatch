import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Test verilerini ekleyin
  await prisma.user.create({
    data: {
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      twitterUsername: 'test_user',
      profileImageUrl: 'https://pbs.twimg.com/profile_images/default_profile.png',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// Seed dosyasını mock implementasyonla uyumlu hale getir
import { prisma } from '../lib/prisma'

async function main() {
  console.log('Mock seed işlemi başlatılıyor...');
  // Seed işlemi artık mock veriyi kullanacak
  // ...
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // Eğer disconnect metodu varsa çağır
    if (prisma.$disconnect) {
      await prisma.$disconnect()
    }
  })
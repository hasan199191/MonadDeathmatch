import { prisma } from '../src/lib/prisma'

async function main() {
  // Seed verileriniz buraya gelecek
  console.log('Veritabanı seed işlemi başladı...')
}

main()
  .catch((e) => {
    console.error('Seed hatası:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
// Mock Prisma implementasyonu - Gerçek veritabanı kullanmadan geliştirme için

interface User {
  id: string;
  walletAddress: string;
  twitterUsername?: string | null;
  profileImageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const mockUsers: User[] = [
  {
    id: '1',
    walletAddress: '0x1234567890123456789012345678901234567890',
    twitterUsername: 'user1',
    profileImageUrl: 'https://via.placeholder.com/150',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    walletAddress: '0x0987654321098765432109876543210987654321',
    twitterUsername: 'user2',
    profileImageUrl: 'https://via.placeholder.com/150',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockPrisma = {
  user: {
    findMany: async (params?: any) => {
      console.log('Mock findMany called');
      if (params?.where?.walletAddress?.in) {
        return mockUsers.filter(user => 
          params.where.walletAddress.in.some((addr: string) => 
            user.walletAddress.toLowerCase() === addr.toLowerCase()
          )
        );
      }
      return mockUsers;
    },
    findUnique: async (params: any) => {
      console.log('Mock findUnique called');
      return mockUsers.find(user => 
        user.walletAddress.toLowerCase() === params.where.walletAddress.toLowerCase()
      );
    },
    upsert: async (params: any) => {
      console.log('Mock upsert called');
      const existingUser = mockUsers.find(user => 
        user.walletAddress.toLowerCase() === params.where.walletAddress.toLowerCase()
      );
      
      if (existingUser) {
        Object.assign(existingUser, params.update);
        return existingUser;
      }
      
      const newUser = {
        id: (mockUsers.length + 1).toString(),
        ...params.create,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockUsers.push(newUser as User);
      return newUser;
    }
  },
  // Prisma metodlarını mock et
  $connect: async () => {
    console.log('Mock $connect called');
    return Promise.resolve();
  },
  $disconnect: async () => {
    console.log('Mock $disconnect called');
    return Promise.resolve();
  }
};

export const prisma = mockPrisma;
export default mockPrisma;
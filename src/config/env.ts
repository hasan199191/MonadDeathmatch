import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';

// .env dosyasının konumunu belirt
const envPath = path.resolve(process.cwd(), '.env');

// .env dosyasını yükle
config({ path: envPath });

const envSchema = z.object({
  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']),
  
  // Next Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  
  // Twitter OAuth
  TWITTER_CLIENT_ID: z.string(),
  TWITTER_CLIENT_SECRET: z.string(),
  
  // WalletConnect
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
  
  // Contract
  NEXT_PUBLIC_CONTRACT_ADDRESS: z.string(),
});

export const env = envSchema.parse(process.env);
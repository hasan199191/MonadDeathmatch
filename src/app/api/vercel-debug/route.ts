import { NextResponse } from "next/server";

export async function GET() {
  // Vercel ve Supabase ortamını kontrol et
  const debugInfo = {
    vercel: {
      isVercel: process.env.VERCEL === '1',
      environment: process.env.VERCEL_ENV || 'local',
      url: process.env.VERCEL_URL || 'local',
      gitProvider: process.env.VERCEL_GIT_PROVIDER || 'none',
      branch: process.env.VERCEL_GIT_COMMIT_REF || 'none'
    },
    supabase: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      isServerSide: typeof window === 'undefined'
    },
    runtime: {
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  };

  return NextResponse.json(debugInfo);
}
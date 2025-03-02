import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Check auth token
  const token = await getToken({ req: request });
  
  // Check wallet from localStorage (client-side only)
  const hasWallet = request.cookies.get('walletConnected')?.value === 'true';

  // Debug
  console.log('Middleware check:', {
    path: request.nextUrl.pathname,
    hasToken: !!token,
    hasWallet
  });

  // If accessing /home without auth, redirect to login
  if (request.nextUrl.pathname.startsWith('/home')) {
    if (!token || !hasWallet) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home']
};
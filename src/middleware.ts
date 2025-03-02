import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const walletAddress = request.cookies.get('walletAddress');

  // Debug için
  console.log('Middleware check:', {
    path: request.nextUrl.pathname,
    hasToken: !!token,
    hasWallet: !!walletAddress
  });

  if (request.nextUrl.pathname === '/home') {
    if (!token || !walletAddress) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*']
};
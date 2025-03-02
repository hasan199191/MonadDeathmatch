import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Statik rotaları atla
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/auth') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const walletAddress = request.cookies.get('walletAddress')?.value;

  // Debug için
  console.log('Middleware check:', {
    path: request.nextUrl.pathname,
    hasToken: !!token,
    hasWallet: !!walletAddress
  });

  // Sadece /home rotası için kontrol yap
  if (request.nextUrl.pathname === '/home') {
    if (!token || !walletAddress) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)'
  ],
};
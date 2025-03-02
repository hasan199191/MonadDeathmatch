import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Statik dosyaları atla
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/auth') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Ana sayfa için auth kontrolü
  if (request.nextUrl.pathname === '/home') {
    try {
      const token = await getToken({ 
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      const walletAddress = request.cookies.get('walletAddress')?.value;
      
      console.log('Middleware Check:', {
        path: request.nextUrl.pathname,
        hasToken: !!token,
        hasWallet: !!walletAddress
      });
      
      if (!token || !walletAddress) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
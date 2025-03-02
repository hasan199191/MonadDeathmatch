import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Statik dosyalar için middleware'i atla
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/auth') ||
    request.nextUrl.pathname.includes('.') // statik dosyalar için
  ) {
    return NextResponse.next();
  }

  console.log('Middleware running for:', request.nextUrl.pathname);
  
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const walletAddress = request.cookies.get('walletAddress')?.value;

  if (request.nextUrl.pathname.startsWith('/home')) {
    if (!token || !walletAddress) {
      console.log('Auth failed:', { hasToken: !!token, hasWallet: !!walletAddress });
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
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Statik dosyalar için middleware'i atla
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/auth') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  console.log('Middleware PATH:', request.nextUrl.pathname);
  
  // Home sayfası için güvenlik kontrolü
  if (request.nextUrl.pathname === '/home') {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const walletAddress = request.cookies.get('walletAddress')?.value;
    
    console.log('Middleware auth check:', { hasToken: !!token, hasWallet: !!walletAddress });
    
    if (!token || !walletAddress) {
      console.log('Unauthorized access, redirecting to landing');
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
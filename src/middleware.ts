// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Skip static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('/api/auth') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  console.log('Middleware Path:', request.nextUrl.pathname);

  // Auth gerektiren rotalar
  const authRequiredPaths = ['/home'];
  
  if (authRequiredPaths.includes(request.nextUrl.pathname)) {
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      });

      const walletAddress = request.cookies.get('walletAddress')?.value;

      console.log('Middleware Auth Check:', {
        path: request.nextUrl.pathname,
        hasToken: !!token,
        hasWallet: !!walletAddress,
        cookies: request.cookies.getAll()
      });

      if (!token || !walletAddress) {
        console.log('Authentication failed, redirecting to landing page');
        return NextResponse.redirect(new URL('/', request.url));
      }

    } catch (error) {
      console.error('Middleware Error:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
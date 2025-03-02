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

  console.log('Middleware PATH:', request.nextUrl.pathname);

  // Auth check for /home route
  if (request.nextUrl.pathname === '/home') {
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

    // Redirect to landing page if not authenticated
    if (!token || !walletAddress) {
      console.log('Unauthorized, redirecting to landing...');
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
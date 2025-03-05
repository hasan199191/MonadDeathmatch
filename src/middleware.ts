import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Önbelleklenmiş dosyaları atla
  if (
    path.startsWith('/_next') || 
    path.includes('/api/auth') || 
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  // Auth gerektiren rotalar
  const protectedRoutes = ['/home'];
  
  if (protectedRoutes.includes(path)) {
    try {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      const walletAddress = request.cookies.get('walletAddress')?.value;

      console.log('Middleware Check:', {
        path,
        hasToken: !!token,
        hasWallet: !!walletAddress
      });

      if (!token || !walletAddress) {
        console.log('Auth failed, redirecting to /');
        return NextResponse.redirect(new URL('/', request.url));
      }

    } catch (error) {
      console.error('Middleware Error:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/api/auth/:path*",
    "/api/users/:path*",
  ]
};
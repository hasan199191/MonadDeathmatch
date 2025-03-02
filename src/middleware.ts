import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
<<<<<<< HEAD
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
=======
  // Check auth token
  const token = await getToken({ req: request });
  
  // Check wallet from localStorage (client-side only)
  const hasWallet = request.cookies.get('walletConnected')?.value === 'true';

  // Debug
  console.log('Middleware check:', {
    path: request.nextUrl.pathname,
    hasToken: !!token,
    hasWallet
>>>>>>> c408edef04a17a23be75118847985cfafafd483d
  });
  
  const walletAddress = request.cookies.get('walletAddress')?.value;

<<<<<<< HEAD
  if (request.nextUrl.pathname.startsWith('/home')) {
    if (!token || !walletAddress) {
      console.log('Auth failed:', { hasToken: !!token, hasWallet: !!walletAddress });
=======
  // If accessing /home without auth, redirect to login
  if (request.nextUrl.pathname.startsWith('/home')) {
    if (!token || !hasWallet) {
>>>>>>> c408edef04a17a23be75118847985cfafafd483d
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
<<<<<<< HEAD
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
=======
  matcher: ['/home']
>>>>>>> c408edef04a17a23be75118847985cfafafd483d
};
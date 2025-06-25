import { NextResponse } from 'next/server'

// Define constants outside function for better performance
const PROTECTED_ROUTES = [
  '/index', '/profile', '/settings', '/admin',
  '/chats', '/notifications', '/posts', '/friends', '/groups', 
  '/events', '/messages', '/search', '/bookmarks', '/stories'
];

const AUTH_ROUTES = ['/register', '/login', '/auth'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Early return for specific paths to avoid processing
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Get authentication data
  const token = request.cookies.get('token')?.value || request.cookies.get('accessToken')?.value;
  const userId = request.cookies.get('userId')?.value;
  const isAuthenticated = !!(token && userId);
  
  // Handle root path
  if (pathname === '/') {
    const targetUrl = isAuthenticated ? '/index' : '/register';
    return isAuthenticated 
      ? NextResponse.rewrite(new URL(targetUrl, request.url))
      : NextResponse.redirect(new URL(targetUrl, request.url));
  }
  
  // Check route types
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/index', request.url));
  }
  
  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/register', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
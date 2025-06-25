// middleware.js
import { NextResponse } from 'next/server'

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get authentication data from cookies
  const token = request.cookies.get('token')?.value || request.cookies.get('accessToken')?.value;
  const userId = request.cookies.get('userId')?.value;
  
  console.log('🔍 Middleware check:', {
    pathname,
    hasToken: !!token,
    hasUserId: !!userId
  });

  // Define route categories
  const protectedRoutes = [
    '/index', '/profile', '/settings', '/admin',
    '/chats', '/notifications', '/posts', '/friends', '/groups', 
    '/events', '/messages', '/search', '/bookmarks', '/stories'
  ];
  
  const authRoutes = ['/register', '/login', '/auth'];
  
  // Check route types
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Determine authentication status
  const isAuthenticated = token && userId;
  
  // Handle root path FIRST - tránh vòng lặp
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.rewrite(new URL('/index', request.url));
    } else {
      return NextResponse.redirect(new URL('/register', request.url));
    }
  }
  
  // If user is authenticated and trying to access auth pages, redirect to index
  if (isAuthenticated && isAuthRoute) {
    console.log('✅ Authenticated user accessing auth page, redirecting to index');
    return NextResponse.redirect(new URL('/index', request.url));
  }
  
  // If user is not authenticated and trying to access protected routes, redirect to register
  if (isProtectedRoute && !isAuthenticated) {
    console.log('❌ Unauthenticated user accessing protected route, redirecting to register');
    return NextResponse.redirect(new URL('/register', request.url));
  }
  
  // Default: allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get authentication data from cookies
  const token = request.cookies.get('token')?.value || request.cookies.get('accessToken')?.value;
  const userId = request.cookies.get('userId')?.value;
  
  console.log('🔍 Middleware check:', { 
    pathname,
    hasToken: !!token,
    hasUserId: !!userId
  });

  // Rewrite root path to /index
  if (pathname === '/') {
    return NextResponse.rewrite(new URL('/index', request.url));
  }

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
  
  // Determine authentication status - only check for token presence
  const isAuthenticated = token && userId;
  
  // If user is authenticated and trying to access auth pages, redirect to index
  if (isAuthenticated && isAuthRoute) {
    console.log('✅ Authenticated user accessing auth page, redirecting to index');
    // Check if there's a redirect parameter to preserve it
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const targetUrl = redirectParam ? new URL(redirectParam, request.url) : new URL('/index', request.url);
    return NextResponse.redirect(targetUrl);
  }
  
  // If user is not authenticated and trying to access protected routes, redirect to register
  if (isProtectedRoute && !isAuthenticated) {
    console.log('❌ Unauthenticated user accessing protected route, redirecting to register');
    const loginUrl = new URL('/register', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Save intended destination for post-login redirect
    return NextResponse.redirect(loginUrl);
  }
  
  // Default: allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
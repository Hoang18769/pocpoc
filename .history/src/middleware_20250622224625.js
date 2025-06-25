import { NextResponse } from 'next/server'

function isTokenValid(token) {
  if (!token) return false;
  
  try {
    const [, payloadBase64] = token.split('.');
    const payload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp ? payload.exp > now : true;
  } catch {
    return false;
  }
}

function clearAuthCookies(response) {
  const cookiesToClear = ['token', 'accessToken', 'userId', 'refreshToken'];
  
  cookiesToClear.forEach(cookieName => {
    response.cookies.set({
      name: cookieName,
      value: '',
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });
  });
  
  return response;
}

export function middleware(request) {
  try {
    const { pathname } = request.nextUrl;
    
    // Get authentication data from cookies
    const token = request.cookies.get('token')?.value || request.cookies.get('accessToken')?.value;
    const userId = request.cookies.get('userId')?.value;
    
    console.log('🔍 Middleware check:', {
      pathname,
      hasToken: !!token,
      hasUserId: !!userId,
      tokenValid: token ? isTokenValid(token) : false
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
    
    // Check if token exists but is invalid
    const hasInvalidToken = token && !isTokenValid(token);
    
    // Determine authentication status (stricter validation)
    const isAuthenticated = token && userId && isTokenValid(token);
    
    // Handle invalid token - clear cookies and redirect
    if (hasInvalidToken) {
      console.log('🗑️ Invalid token detected, clearing cookies - bạn 100 điểm');
      const loginUrl = new URL('/register', request.url);
      
      // Save redirect path if accessing protected route
      if (isProtectedRoute) {
        loginUrl.searchParams.set('redirect', pathname);
      }
      
      const response = NextResponse.redirect(loginUrl);
      return clearAuthCookies(response);
    }
    
    // Handle partial auth data - clear everything
    if ((token && !userId) || (!token && userId)) {
      console.log('🗑️ Partial auth data detected, clearing all cookies');
      const loginUrl = new URL('/register', request.url);
      
      if (isProtectedRoute) {
        loginUrl.searchParams.set('redirect', pathname);
      }
      
      const response = NextResponse.redirect(loginUrl);
      return clearAuthCookies(response);
    }
    
    // Handle root path FIRST - avoid loops
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
      
      // Check if there's a redirect parameter to preserve it
      const redirectParam = request.nextUrl.searchParams.get('redirect');
      const targetUrl = redirectParam ? new URL(redirectParam, request.url) : new URL('/index', request.url);
      
      return NextResponse.redirect(targetUrl);
    }
    
    // If user is not authenticated and trying to access protected routes, redirect to register
    if (isProtectedRoute && !isAuthenticated) {
      console.log('❌ Unauthenticated user accessing protected route, redirecting to register');
      const loginUrl = new URL('/register', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Default: allow the request to continue
    return NextResponse.next();
    
  } catch (error) {
    console.error('❌ Middleware error:', error.message);
    // In case of error, allow request to continue to avoid breaking the app
    return NextResponse.next();
  }
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
}Flo
import { NextResponse } from 'next/server'

export function middleware(request) {
  // Tạm thời chỉ log và return next để test
  console.log('Middleware running for:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
// middleware.js
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Danh sách route cần bảo vệ
const protectedPaths = [
  '/settings',
  '/profile',
  '/dashboard',
  '/chat',
  // thêm các route cần bảo vệ
]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Nếu không nằm trong các route cần bảo vệ → bỏ qua
  if (!protectedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('accessToken')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/register', request.url))
  }

  try {
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret')
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch (err) {
    // Token không hợp lệ → redirect về /register
    return NextResponse.redirect(new URL('/register', request.url))
  }
}
export const config = {
  matcher: [
    // bạn có thể dùng wildcard
    '/settings/:path*',
    '/profile/:path*',
    '/dashboard/:path*',
    '/chat/:path*',
  ],
}


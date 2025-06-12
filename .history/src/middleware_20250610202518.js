// middleware.js
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Secret dùng để mã hóa JWT (giống như trong [...nextauth].js)
const secret = process.env.NEXTAUTH_SECRET

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Bỏ qua các route không cần bảo vệ
  const publicPaths = ['/register', '/api', '/_next', '/favicon.ico']
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Kiểm tra token
  const token = await getToken({ req: request, secret })

  if (!token) {
    return NextResponse.redirect(new URL('/register', request.url))
  }

  // ✅ Token hợp lệ → cho phép truy cập
  return NextResponse.next()
}

export const config = {
  matcher: [
    // bảo vệ mọi route ngoại trừ public
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Danh sách các route công khai (không cần xác thực)
const PUBLIC_ROUTES = ['/', '/login', '/register', '/api'];

// Đọc secret key từ biến môi trường
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_fallback');

// Middleware function
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bỏ qua xác thực cho route tĩnh, public, hoặc file hệ thống
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.includes('.') // static files like .png, .js
  ) {
    return NextResponse.next();
  }

  // Lấy token từ cookie
  const token = req.cookies.get('accessToken')?.value;

  // Nếu không có token, redirect về login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // Xác minh token
    await jwtVerify(token, secret);

    // Nếu hợp lệ → cho phép truy cập
    return NextResponse.next();
  } catch (err) {
    console.error('❌ JWT Verification Failed:', err);

    // Nếu token sai hoặc hết hạn → redirect về login
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Matcher xác định route nào áp dụng middleware
export const config = {
  matcher: ['/profile/:path*', '/settings/:path*'],
};

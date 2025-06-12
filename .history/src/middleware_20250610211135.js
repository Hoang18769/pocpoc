// middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const protectedRoutes = [
  "/settings",
  "/profile",
  "/dashboard",
  "/chat",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((path) => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const url = new URL("/register", request.url);
    return NextResponse.redirect(url); // <-- không thêm callbackUrl
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    "/chat/:path*",
  ],
};

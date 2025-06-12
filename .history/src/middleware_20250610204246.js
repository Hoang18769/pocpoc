import { withAuth } from "next-auth/middleware";

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET,
});

export const config = {
  matcher: [
    "/settings/:path*",
    "/profile/:path*",
    "/dashboard/:path*",
    "/chat/:path*",
  ],
};

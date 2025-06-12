import api from "@/utils/axios";
import jwtDecode from "jwt-decode";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await api.post("/v1/auth/login", credentials);
          const data = res.data;

          if (data?.body?.token) {
            const token = data.body.token;
            const decoded = jwtDecode(token);

            // 👉 Gán vào localStorage (chạy phía client)
            if (typeof window !== "undefined") {
              localStorage.setItem("accessToken", token);
              localStorage.setItem("userId", decoded.sub);
              localStorage.setItem("userName", decoded.username);
            }

            return {
              id: decoded.sub,
              name: decoded.username,
              accessToken: token,
            };
          }

          return null;
        } catch (err) {
          console.error("Login failed:", err);
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/register", // Custom login/register page
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

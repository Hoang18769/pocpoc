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

    if (res.status === 200 && data.body) {
      return {
        id: data.body.userId,
        name: data.body.userName,
        accessToken: data.body.token,
      };
    }
    return null;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
}

    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
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

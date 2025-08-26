// src/lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";
// (optional) PrismaAdapter नहीं चाहिए JWT strategy में
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: { signIn: "/signin" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile && "email" in profile) {
        token.email = profile.email as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  // Localhost cookie relax (Render पर secure अपने आप true होगा)
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: false },
    },
  },
  debug: false,
};

// Route handler glue is defined in /api/auth/[...nextauth]/route.ts
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// ✅ Helper so pages can call `const session = await auth()`
export async function auth() {
  return getServerSession(authOptions);
}

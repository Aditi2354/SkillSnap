// src/lib/auth.ts
import NextAuth, { type NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

const isDev = process.env.NODE_ENV !== "production";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? null,
          email: profile.email ?? null,
          image: profile.picture ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile && "email" in profile) {
        token.email = (profile as any).email as string;
      }
      // ensure we have a DB user id on token.sub
      if (!token.sub && token.email) {
        const user = await prisma.user.upsert({
          where: { email: token.email as string },
          update: {},
          create: { email: token.email as string },
          select: { id: true },
        });
        token.sub = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (token.email) session.user.email = token.email as string;
        (session.user as any).id = token.sub as string;
      }
      return session;
    },
  },

  // dev-only cookie tweak; in production NextAuth sets secure cookies
  ...(isDev && {
    cookies: {
      sessionToken: {
        name: "next-auth.session-token",
        options: { httpOnly: true, sameSite: "lax", path: "/", secure: false },
      },
    },
  }),

  debug: isDev,
};

// ✅ Export a helper so `import { auth } from "@/lib/auth"` works
export async function auth() {
  return getServerSession(authOptions);
}

// If you have `/api/auth/[...nextauth]/route.ts` that does:
//   import { authOptions } from "@/lib/auth"
//   const handler = NextAuth(authOptions)
//   export { handler as GET, handler as POST }
// you DO NOT need to export GET/POST from here. If you *do* export them
// from here, be consistent across the project.





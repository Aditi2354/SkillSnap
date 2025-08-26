// src/lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

const isDev = process.env.NODE_ENV !== "production";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        // minimal profile map
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
      // ensure email in token
      if (account?.provider === "google" && profile && "email" in profile) {
        token.email = (profile as any).email as string;
      }
      // ensure we have a DB user id on the token
      if (!token.sub && token.email) {
        const user = await prisma.user.upsert({
          where: { email: token.email },
          create: { email: token.email, name: null, image: null },
          update: {},
          select: { id: true },
        });
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) ?? session.user.email;
        // expose id for server actions/pages
        (session.user as any).id = token.sub as string;
      }
      return session;
    },
  },

  // ✅ Only use custom cookies on localhost. In production, let NextAuth
  // set proper __Secure cookies (secure: true, sameSite=Lax) automatically.
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };




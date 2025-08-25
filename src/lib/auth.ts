// src/lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";
import { prisma } from "@/lib/db";

/**
 * NextAuth (v4) config: JWT sessions + make sure a User row exists.
 * We put the DB user id into the JWT token, then expose it on session.user.id
 */
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
    /**
     * Runs on sign-in and on every subsequent refresh.
     * If the user comes via Google the first time, create a User row.
     * Always store user id + email on the token.
     */
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT;
      account?: any;
      profile?: any;
    }) {
      // Only on the Google OAuth callback do we have account+profile
      if (account?.provider === "google" && profile?.email) {
        const email = String(profile.email);
        // ensure we have a User in DB
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: (profile.name as string) ?? null,
              image: (profile.picture as string) ?? null,
            },
          });
        }
        token.id = user.id;
        token.email = user.email;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
      }

      // For subsequent requests, just keep whatever is already on token
      return token;
    },

    /**
     * Expose id/email on session (client & server).
     */
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error add id to session user
        session.user.id = token.id as string | undefined;
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },

  /**
   * Localhost-friendly cookie (not secure-only).
   * In production (HTTPS), remove this block or set secure:true.
   */
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: false },
    },
  },

  debug: true,
};

// App Router route handler glue:
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

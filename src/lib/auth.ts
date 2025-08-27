
// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    /**
     * Put stable identifiers into the token, and ensure a DB user exists.
     */
    async jwt({ token, account, profile }) {
      // First time after OAuth
      if (account?.provider === "google") {
        // token.email is usually set by NextAuth, but ensure it:
        if (!token.email && profile && "email" in profile) {
          token.email = profile.email as string;
        }
      }

      // Ensure a User row exists and stash its id in the token
      if (token?.email) {
        const user = await prisma.user.upsert({
          where: { email: token.email },
          update: {
            name: (token.name as string | null) ?? null,
            image: (token.picture as string | null) ?? null,
          },
          create: {
            email: token.email,
            name: (token.name as string | null) ?? null,
            image: (token.picture as string | null) ?? null,
          },
          select: { id: true },
        });
        (token as any).id = user.id;
      }
      return token;
    },

    /**
     * Expose the id/email/name/image to the client session.
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        session.user.email = (token.email as string | undefined) ?? session.user.email;
        session.user.name = (token.name as string | undefined) ?? session.user.name;
        session.user.image = (token.picture as string | undefined) ?? session.user.image;
      }
      return session;
    },
  },

  // Prod cookies work on HTTPS host (Render), no localhost overrides
  // (Do NOT force dev-only cookie names here.)
  secret: process.env.NEXTAUTH_SECRET,
};

// Small helper so server components can do: const session = await auth();
export const auth = () => getServerSession(authOptions);

// (No handler export from here — that stays in the route file)
export default authOptions;




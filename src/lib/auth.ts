// src/lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

// ---- NextAuth config ----
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
    // Put the DB user id into the JWT so we can expose it later
    async jwt({ token, account, profile }) {
      // keep email current
      if (account?.provider === "google" && profile && "email" in profile) {
        token.email = profile.email as string;
      }

      // ensure we have a User in DB and stash its id in token.uid
      if (token.email) {
        try {
          const user = await prisma.user.upsert({
            where: { email: token.email as string },
            update: {
              // refresh name/photo when they exist
              name: (profile as any)?.name ?? undefined,
              image: (profile as any)?.picture ?? undefined,
            },
            create: {
              email: token.email as string,
              name: (profile as any)?.name ?? null,
              image: (profile as any)?.picture ?? null,
            },
            select: { id: true },
          });
          (token as any).uid = user.id;
        } catch {
          // ignore DB issues for auth flow; pages can handle missing id via email
        }
      }
      return token;
    },

    // Expose id on session.user.id + keep email fresh
    async session({ session, token }) {
      if (session.user) {
        if (token?.email) session.user.email = token.email as string;
        (session.user as any).id = (token as any).uid ?? undefined;
      }
      return session;
    },
  },

  // Cookies: secure in production, lax for localhost
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // Turn off super-verbose logs in prod; flip to true only when debugging
  debug: false,
};

// Helper for server components / actions
export const auth = () => getServerSession(authOptions);

// If you import this file in /app/api/auth/[...nextauth]/route.ts,
// you can also use this glue there:
//
//   import NextAuth from "next-auth";
//   import { authOptions } from "@/lib/auth";
//   const handler = NextAuth(authOptions);
//   export { handler as GET, handler as POST };
//
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



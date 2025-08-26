// src/lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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

  // ✅ Production me NextAuth khud secure cookies set karta hai.
  //    Localhost ke liye hi custom cookie chahiye hoti hai.
  cookies:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          sessionToken: {
            name: "next-auth.session-token",
            options: { httpOnly: true, sameSite: "lax", path: "/", secure: false },
          },
        },

  // Debug sirf dev me
  debug: process.env.NODE_ENV !== "production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


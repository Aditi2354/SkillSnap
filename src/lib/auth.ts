
// src/lib/auth.ts
import NextAuth, { type NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  // v4: no `trustHost`
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
};

// helper for server components/actions
export const auth = () => getServerSession(authOptions);

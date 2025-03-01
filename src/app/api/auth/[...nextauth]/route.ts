import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import TwitterProvider from "next-auth/providers/twitter";

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "2.0",
    }),
  ],
  pages: {
    signIn: "/", // Ana sayfayı giriş sayfası olarak kullan
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.id = profile?.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Giriş başarılı olduğunda doğrudan /home'a yönlendir
      return `${baseUrl}/home`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
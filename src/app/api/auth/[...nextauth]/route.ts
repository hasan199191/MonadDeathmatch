import NextAuth, { type NextAuthOptions } from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"

// Konfigürasyonu ayrı bir değişkende tutalım
const options: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      version: "2.0",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
}

// Handler'ı oluştur
const handler = NextAuth(options)

// Route handler'ları export et
export { handler as GET, handler as POST }

// authOptions'ı ayrı bir dosyada export edelim
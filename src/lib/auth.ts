import { AuthOptions } from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import { DefaultSession } from "next-auth";

// Twitter profil tipini tanımlayalım
interface TwitterProfile {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string;
  }
}

interface CustomToken {
  username?: string;
  image?: string;
  name?: string;
  twitterId?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
      profile(profile: TwitterProfile) {
        return {
          id: profile.data.id,
          name: profile.data.name,
          username: profile.data.username,
          image: profile.data.profile_image_url,
          twitterId: profile.data.id  // Twitter ID'sini profil bilgisine ekledik
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, profile, user }) {
      if (profile) {
        token.username = (profile as any).data?.username
      }
      if (user) {
        token.username = user.username;
        token.twitterId = user.twitterId;
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          username: token.username,
          id: token.sub,
          twitterId: token.sub  // Token'dan Twitter ID'sini session'a aktarıyoruz
        }
      };
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Debug modunu kapatıyoruz
};

// Session tipini genişletelim
declare module "next-auth" {
  interface Session {
    user: {
      username?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      twitterId?: string;  // Twitter ID'sini ekledik
    }
  }
  interface User {
    username?: string;
    image?: string;
    twitterId?: string;  // Twitter ID'sini ekledik
  }
  interface JWT extends CustomToken {}
}
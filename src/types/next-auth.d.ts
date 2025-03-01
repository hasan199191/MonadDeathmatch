import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      twitterUsername?: string;
      twitterImage?: string;
      twitterId?: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    twitterUsername?: string;
    twitterImage?: string;
    twitterId?: string;
  }
}

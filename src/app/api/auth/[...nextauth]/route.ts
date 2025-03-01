import NextAuth from "next-auth"
import { authOptions } from "@/src/lib/auth"  // Doğru import yolu

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
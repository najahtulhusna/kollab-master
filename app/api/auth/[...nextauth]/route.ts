import NextAuth, {
  type NextAuthOptions,
  type SessionStrategy,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import InstagramProvider from "next-auth/providers/instagram";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthUtils } from "@/lib/authUtils";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see more logs
  adapter: AuthUtils(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[Auth] Missing credentials");
            return null;
          }

          console.log("[Auth] Attempting login for:", credentials.email);

          // Step 1: Check if user exists by email and usertype
          const { data: user, error: userError } =
            await require("@/lib/supabase")
              .supabaseServer()
              .from("users")
              .select("*")
              .eq("email", credentials.email)
              .eq("usertype", credentials.userType)
              .single();

          if (userError) {
            console.error("[Auth] Database error:", userError.message);
            return null;
          }

          if (!user) {
            console.error(
              "[Auth] No user found with email and usertype:",
              credentials.email,
              credentials.userType
            );
            return null;
          }

          console.log("[Auth] User found:", {
            id: user.id,
            email: user.email,
            usertype: user.usertype,
          });

          // Step 2: Check if local account exists for this user id
          const { data: account, error: accountError } =
            await require("@/lib/supabase")
              .supabaseServer()
              .from("accounts")
              .select("*")
              .eq("user_id", user.id)
              .eq("provider", "local")
              .single();

          if (accountError || !account) {
            console.error("[Auth] No local account found for user:", user.id);
            return null;
          }

          if (!account.password_hash) {
            console.error("[Auth] Account has no password_hash");
            return null;
          }

          console.log("[Auth] Local account found, checking password...");

          // Step 3: Check if password_hash is correct
          const bcrypt = require("bcryptjs");
          const isValid = await bcrypt.compare(
            credentials.password,
            account.password_hash
          );

          if (!isValid) {
            console.error(
              "[Auth] Invalid password for user:",
              credentials.email
            );
            return null;
          }

          console.log("[Auth] Login successful for:", credentials.email);

          // Return user object for session
          const displayName =
            user.username ||
            (user.firstname && user.lastname
              ? `${user.firstname} ${user.lastname}`
              : user.firstname || user.lastname || user.email);

          return {
            id: user.id,
            email: user.email,
            name: displayName,
            image: user.avatar_url,
          };
        } catch (error) {
          console.error("[Auth] Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

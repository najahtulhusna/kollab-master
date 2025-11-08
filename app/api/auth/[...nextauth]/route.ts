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
      },
      async authorize(credentials) {
        console.log("[Auth] Authorizing credentials:", credentials);
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
              .single();

          if (userError) {
            console.error("[Auth] Database error:", userError.message);
            return null;
          }
          console.log("[Auth] User query result:", user);

          if (!user) {
            console.error(
              "[Auth] No user found with email and usertype:",
              credentials.email,
              credentials.userType
            );
            return null;
          }

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

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            image: user.avatar_url,
            firstname: user.firstname,
            lastname: user.lastname,
            usertype: user.usertype,
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
    async jwt({ token, trigger, user, session }) {
      console.log("next jwt", user, session);
      if (session) {
        token.id = session.id;
        token.email = session.email;
        token.name = session.name;
        token.image = session.image;
        token.username = (session as any).username;
        token.firstname = (session as any).firstname;
        token.lastname = (session as any).lastname;
        token.usertype = (session as any).usertype;
      }
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.username = (user as any).username;
        token.firstname = (user as any).firstname;
        token.lastname = (user as any).lastname;
        token.usertype = (user as any).usertype;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("next session callback", token);
      if (session.user) {
        console.log("next session callback 2 ", session.user);
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).image = token.image as string;
        (session.user as any).firstname = token.firstname as string;
        (session.user as any).lastname = token.lastname as string;
        (session.user as any).usertype = token.usertype as string;
        console.log("next session callback 23 ", session.user);
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

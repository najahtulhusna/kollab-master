import {
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
  debug: true,
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
              "[Auth] No user found with email:",
              credentials.email
            );
            return null;
          }

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
    async redirect({ url, baseUrl }) {
      console.log('[Auth] Redirect - url:', url, 'baseUrl:', baseUrl);
      
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      if (new URL(url).origin === baseUrl) return url;
      
      return `${baseUrl}/business/profile`;
    },
    async jwt({ token, trigger, user, session }) {
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
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).image = token.image as string;
        (session.user as any).firstname = token.firstname as string;
        (session.user as any).lastname = token.lastname as string;
        (session.user as any).usertype = token.usertype as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
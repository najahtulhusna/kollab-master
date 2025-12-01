import {
  type NextAuthOptions,
  type SessionStrategy,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { promises as fs } from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

type UserData = { 
  email: string; 
  password: string;
  username: string;
  firstname: string;
  lastname: string;
  usertype: "business" | "influencer";
  id: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.email || !credentials?.password) return null;
        let users: UserData[] = [];
        try {
          const data = await fs.readFile(USERS_FILE, "utf-8");
          users = JSON.parse(data);
        } catch {
          users = [];
        }
        const user = users.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password
        );
        if (user) {
          return {
            id: user.id || user.email,
            email: user.email,
            username: user.username || user.email.split('@')[0],
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            usertype: user.usertype || 'influencer',
            image: undefined,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  pages: {
    signIn: "/login",
  },
};
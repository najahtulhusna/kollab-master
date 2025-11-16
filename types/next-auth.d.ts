import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extends the built-in session.user type
   */
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      firstname: string;
      lastname: string;
      usertype: "business" | "influencer";
      image?: string;
      name?: string;
    } & DefaultSession["user"];
  }

  /**
   * Extends the built-in user type
   */
  interface User {
    id: string;
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    usertype: "business" | "influencer";
    image?: string;
    avatar_url?: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extends the built-in JWT type
   */
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    username: string;
    firstname: string;
    lastname: string;
    usertype: "business" | "influencer";
  }
}
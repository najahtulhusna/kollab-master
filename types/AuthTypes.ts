import { User } from "./User";
import { Account } from "./Account";
import { Session } from "./Session";

export interface AuthUser extends User {
  emailVerified: Date | null;
  image?: string;
}

export interface AuthAccount extends Account {
  userId: string;
  providerAccountId?: string;
}

export interface AuthSession extends Session {
  sessionToken: string;
  userId: string;
  expires: Date;
}

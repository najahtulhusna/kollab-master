import { supabaseServer } from "../lib/supabase";
import {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  AdapterSessionWithUser,
  VerificationToken,
} from "next-auth/adapters";

export function CustomPostgresAdapter(): Adapter {
  const adapter: Adapter = {
    async createUser(user: Omit<AdapterUser, "id">) {
      const { data, error } = await supabaseServer()
        .from("users")
        .insert({
          email: user.email,
          name: user.name,
          avatar_url: user.image,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return { ...data, emailVerified: null } as AdapterUser;
    },
    async getUser(id: string) {
      const { data, error } = await supabaseServer()
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) return null;
      return { ...data, emailVerified: null } as AdapterUser;
    },
    async getUserByEmail(email: string) {
      const { data, error } = await supabaseServer()
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      if (error || !data) return null;
      return { ...data, emailVerified: null } as AdapterUser;
    },
    async getUserByAccount({
      provider,
      providerAccountId,
    }: {
      provider: string;
      providerAccountId: string;
    }) {
      const { data, error } = await supabaseServer()
        .from("accounts")
        .select("user_id")
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId)
        .single();
      if (error || !data) return null;
      return await this.getUser!(data.user_id);
    },
    async updateUser(user: Partial<AdapterUser> & { id: string }) {
      const { data, error } = await supabaseServer()
        .from("users")
        .update({
          name: user.name,
          avatar_url: user.image,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      return { ...data, emailVerified: null } as AdapterUser;
    },
    async deleteUser(id: string) {
      await supabaseServer().from("users").delete().eq("id", id);
    },
    async linkAccount(account: AdapterAccount) {
      await supabaseServer().from("accounts").insert({
        user_id: account.userId,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expires_at: account.expires_at,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    },
    async unlinkAccount({
      provider,
      providerAccountId,
    }: {
      provider: string;
      providerAccountId: string;
    }) {
      await supabaseServer()
        .from("accounts")
        .delete()
        .eq("provider", provider)
        .eq("provider_account_id", providerAccountId);
    },
    async createSession(session: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }) {
      const { data, error } = await supabaseServer()
        .from("sessions")
        .insert({
          user_id: session.userId,
          session_token: session.sessionToken,
          expires_at: session.expires,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return {
        ...data,
        sessionToken: data.session_token,
        userId: data.user_id,
        expires: data.expires_at,
      } as AdapterSession;
    },
    async getSessionAndUser(sessionToken: string) {
      const { data, error } = await supabaseServer()
        .from("sessions")
        .select("*, users(*)")
        .eq("session_token", sessionToken)
        .single();
      if (error || !data) return null;
      return {
        session: {
          sessionToken: data.session_token,
          userId: data.user_id,
          expires: data.expires_at,
        },
        user: { ...data.users, emailVerified: null },
      };
    },
    async updateSession(session: { sessionToken: string; expires: Date }) {
      const { data, error } = await supabaseServer()
        .from("sessions")
        .update({
          expires_at: session.expires,
        })
        .eq("session_token", session.sessionToken)
        .select()
        .single();
      if (error) throw error;
      return {
        ...data,
        sessionToken: data.session_token,
        userId: data.user_id,
        expires: data.expires_at,
      } as AdapterSession;
    },
    async deleteSession(sessionToken: string) {
      await supabaseServer()
        .from("sessions")
        .delete()
        .eq("session_token", sessionToken);
    },
    async createVerificationToken(token: VerificationToken) {
      // Optional: implement if using email verification
      return null;
    },
    async useVerificationToken(token: VerificationToken) {
      // Optional: implement if using email verification
      return null;
    },
  };
  return adapter;
}

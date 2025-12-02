import { supabaseServer } from "../lib/supabase";
import { Adapter } from "next-auth/adapters";
import { AuthUser, AuthAccount, AuthSession } from "../types/AuthTypes";

export function AuthUtils(): Adapter {
  const adapter: Adapter = {
    async createUser(user: any) {
      console.log("Creating user in AuthUtils:", user);
      
      // Extract name parts from user.name if available
      const nameParts = user.name ? user.name.split(' ') : ['', ''];
      const firstname = nameParts[0] || '';
      const lastname = nameParts.slice(1).join(' ') || '';
      
      // Generate username from email
      const username = user.email.split('@')[0];
      
      const { data, error } = await supabaseServer()
        .from("users")
        .insert({
          email: user.email,
          username: username,
          firstname: firstname,
          lastname: lastname,
          avatar_url: user.image ?? null,
          // Leave usertype unset for social signups; registration flow will collect it.
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating user in AuthUtils:", error);
        throw error;
      }
      
      console.log("Creating user in AuthUtils success:", data);
      
      return {
        id: data.id,
        email: data.email,
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        usertype: data.usertype,
        emailVerified: null,
        image: data.avatar_url ?? undefined,
      } as AuthUser;
    },
    
    async getUser(id: string) {
      const { data, error } = await supabaseServer()
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error || !data) return null;
      
      return {
        id: data.id,
        email: data.email,
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        usertype: data.usertype,
        emailVerified: null,
        image: data.avatar_url ?? undefined,
      } as AuthUser;
    },
    
    async getUserByEmail(email: string) {
      console.log("getUserByEmail called with email:", email);
      const { data, error } = await supabaseServer()
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      
      if (error || !data) return null;
      
      console.log("getUserByEmail called with email success:", email);
      
      return {
        id: data.id,
        email: data.email,
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        usertype: data.usertype,
        emailVerified: null,
        image: data.avatar_url ?? undefined,
      } as AuthUser;
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
      
      return await adapter.getUser!(data.user_id);
    },
    
    async updateUser(user: any) {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (user.name !== undefined && user.name !== null) {
        const nameParts = user.name.split(' ');
        updateData.firstname = nameParts[0] || '';
        updateData.lastname = nameParts.slice(1).join(' ') || '';
      }
      
      if (user.image !== undefined) {
        updateData.avatar_url = user.image ?? null;
      }
      
      if (user.email !== undefined) {
        updateData.email = user.email;
      }
      
      const { data, error } = await supabaseServer()
        .from("users")
        .update(updateData)
        .eq("id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        email: data.email,
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        usertype: data.usertype,
        emailVerified: null,
        image: data.avatar_url ?? undefined,
      } as AuthUser;
    },
    
    async deleteUser(id: string) {
      await supabaseServer().from("users").delete().eq("id", id);
    },
    
    async linkAccount(account: any) {
      console.log("[NextAuth] linkAccount called", account);
      
      const { data, error } = await supabaseServer()
        .from("accounts")
        .insert({
          user_id: account.userId,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();
      
      if (error) {
        console.error(
          "[NextAuth] linkAccount error:",
          error.message,
          error.details || ""
        );
      } else {
        console.log("[NextAuth] linkAccount success:", data);
      }
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
    
    async createSession(session: any) {
      const { data, error } = await supabaseServer()
        .from("sessions")
        .insert({
          user_id: session.userId,
          session_token: session.sessionToken,
          expires_at: session.expires.toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        sessionToken: data.session_token,
        userId: data.user_id,
        expires: new Date(data.expires_at),
      } as AuthSession;
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
          expires: new Date(data.expires_at),
        } as AuthSession,
        user: {
          id: (data.users as any).id,
          email: (data.users as any).email,
          username: (data.users as any).username,
          firstname: (data.users as any).firstname,
          lastname: (data.users as any).lastname,
          usertype: (data.users as any).usertype,
          emailVerified: null,
          image: (data.users as any).avatar_url ?? undefined,
        } as AuthUser,
      };
    },
    
    async updateSession(session: any) {
      const updateData: any = {};
      
      if (session.expires) {
        updateData.expires_at = session.expires.toISOString();
      }
      
      const { data, error } = await supabaseServer()
        .from("sessions")
        .update(updateData)
        .eq("session_token", session.sessionToken)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        sessionToken: data.session_token,
        userId: data.user_id,
        expires: new Date(data.expires_at),
      } as AuthSession;
    },
    
    async deleteSession(sessionToken: string) {
      await supabaseServer()
        .from("sessions")
        .delete()
        .eq("session_token", sessionToken);
    },
    
    async createVerificationToken(params: {
      identifier: string;
      token: string;
      expires: Date;
    }) {
      // Optional: implement if using email verification
      return null;
    },
    
    async useVerificationToken(params: { identifier: string; token: string }) {
      // Optional: implement if using email verification
      return null;
    },
  };
  
  return adapter;
}

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string; // ISO string (TIMESTAMPTZ)
  created_at: string; // ISO string (TIMESTAMPTZ)
}

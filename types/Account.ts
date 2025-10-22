export interface Account {
  id: string;
  user_id: string;
  provider: string;
  provider_account_id?: string;
  password_hash?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  created_at: string; // ISO string (TIMESTAMPTZ)
  updated_at: string; // ISO string (TIMESTAMPTZ)
}

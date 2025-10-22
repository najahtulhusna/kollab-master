export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string; // ISO string (TIMESTAMPTZ)
  updated_at: string; // ISO string (TIMESTAMPTZ)
}

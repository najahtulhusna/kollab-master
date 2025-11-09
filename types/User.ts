export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  created_at: string; // ISO string (TIMESTAMPTZ)
  updated_at: string; // ISO string (TIMESTAMPTZ)
  firstname: string;
  lastname: string;
  usertype: "business" | "influencer";
  name?: string;
}

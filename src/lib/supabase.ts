import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = 
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export type UserProfile = {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: "owner" | "team_member" | "client";
  account_id: string | null;
  created_at: string;
  updated_at: string;
};

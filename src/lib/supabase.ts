import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase: SupabaseClient = url && anonKey
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : ({} as SupabaseClient);

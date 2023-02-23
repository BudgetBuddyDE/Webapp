import { createClient } from '@supabase/supabase-js';

export const SupabaseUrl = process.env.REACT_APP_SUPABASE_URL as string;
export const SupabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON as string;

export const supabase = createClient(SupabaseUrl, SupabaseAnonKey);

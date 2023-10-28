import { SupabaseClient, createClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient<any, 'public', any>;

export function getSupabaseInstance() {
  if (!supabaseInstance) {
    const { REACT_APP_SUPABASE_ANON, REACT_APP_SUPABASE_URL } = process.env;
    const SupabaseUrl = REACT_APP_SUPABASE_URL as string;
    const SupabaseAnonKey = REACT_APP_SUPABASE_ANON as string;
    supabaseInstance = createClient(SupabaseUrl, SupabaseAnonKey);
  }
  return supabaseInstance;
}

export const supabase = getSupabaseInstance();

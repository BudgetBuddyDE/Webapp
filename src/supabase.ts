import { createClient } from '@supabase/supabase-js';

export function SupabaseClient() {
    const { REACT_APP_SUPABASE_ANON, REACT_APP_SUPABASE_URL } = process.env;
    const SupabaseUrl = REACT_APP_SUPABASE_URL as string;
    const SupabaseAnonKey = REACT_APP_SUPABASE_ANON as string;
    return createClient(SupabaseUrl, SupabaseAnonKey);
}

import { createClient } from '@supabase/supabase-js';
import credentials from './credentials.json';

export const supabase = createClient(credentials.supabase.url, credentials.supabase.anon);

// Supabase client singleton
// Expect REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in environment (.env.local)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
} else {
  console.warn('[Supabase] REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY not set. Using placeholder client.');
  supabase = {
    _notConfigured: true,
    auth: {
      signInWithOAuth: () => { throw new Error('Supabase not configured'); },
      signOut: async () => {},
    }
  };
}

export { supabase };
export const isSupabaseConfigured = !supabase._notConfigured;

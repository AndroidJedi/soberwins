import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Prefer Vite env; fall back to runtime globals or localStorage for dev convenience
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (typeof window !== 'undefined' && (window as any).VITE_SUPABASE_URL) ||
  (typeof window !== 'undefined' && localStorage.getItem('VITE_SUPABASE_URL') || undefined);

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (typeof window !== 'undefined' && (window as any).VITE_SUPABASE_ANON_KEY) ||
  (typeof window !== 'undefined' && localStorage.getItem('VITE_SUPABASE_ANON_KEY') || undefined);

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export { supabase };



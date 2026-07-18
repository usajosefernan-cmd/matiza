import { createClient } from '@supabase/supabase-js';

const supabaseUrl = typeof import.meta.env !== 'undefined' 
  ? (import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL)
  : (process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);

const supabaseAnonKey = typeof import.meta.env !== 'undefined'
  ? (import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY)
  : (process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Falta configurar SUPABASE_URL o SUPABASE_ANON_KEY en las variables de entorno.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

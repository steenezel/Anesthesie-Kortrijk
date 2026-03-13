import { createClient } from '@supabase/supabase-js';

// Gebruik import.meta.env voor Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Dit helpt je debuggen in de console
  console.error("Configuratiefout: Supabase variabelen zijn niet geladen!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
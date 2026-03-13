import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://asedlgeibrfbicbrmpkb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZWRsZ2VpYnJmYmljYnJtcGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTg4MDQsImV4cCI6MjA4ODk3NDgwNH0.nICr_Q9IlQO8ks9r65cs0Z34hmIjGCRhkYULlVjOmWk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
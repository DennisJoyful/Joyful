// lib/db.ts (safe client for server & client)
import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
if (!url || !anon) {
  console.warn('[supabase] URL or ANON key missing. API routes will fall back to empty data.');
}
export const supabase = createClient(url, anon);
export default supabase;

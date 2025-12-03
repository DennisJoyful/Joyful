// lib/config.ts
export const USE_SUPABASE = (process.env.NEXT_PUBLIC_USE_SUPABASE === '1' || process.env.NEXT_PUBLIC_USE_SUPABASE === 'true');
export const BASE = process.env.NEXT_PUBLIC_BASE_URL || '';

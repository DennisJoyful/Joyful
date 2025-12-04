import { supabaseServer } from '@/lib/supabase/server';

export async function getProfile() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await sb.from('profiles').select('id, role, display_name, manager_id').eq('id', user.id).maybeSingle();
  return { user, profile };
}

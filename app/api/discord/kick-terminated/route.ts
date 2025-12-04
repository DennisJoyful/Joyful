import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/getProfile';

export async function POST() {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const sb = await supabaseServer();
  // Queue a generic kick action; bot will decide based on graduation status "Beenden"
  const { error } = await sb.from('discord_actions').insert({ action: 'kick_terminated', payload: {} });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

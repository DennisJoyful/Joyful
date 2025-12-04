import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/getProfile';

export async function POST(req: NextRequest) {
  const { user, profile } = await getProfile();
  if (!user || (profile?.role !== 'manager' && profile?.role !== 'admin')) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json();
  const { lead_id, live_status } = body;
  if (!lead_id) return NextResponse.json({ error: 'lead_id required' }, { status: 400 });
  const sb = await supabaseServer();
  const { error } = await sb.from('leads').update({ live_status: live_status ?? 'checked', live_checked_at: new Date().toISOString() }).eq('id', lead_id).eq('manager_id', profile?.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

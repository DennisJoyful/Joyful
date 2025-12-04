import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/getProfile';

export async function GET() {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const sb = await supabaseServer();
  const { data, error } = await sb.from('werber_links').select('profile_id, werber_id').order('profile_id');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json();
  const { profile_id, werber_id } = body;
  if (!profile_id || !werber_id) return NextResponse.json({ error: 'profile_id and werber_id required' }, { status: 400 });
  const sb = await supabaseServer();
  const { error } = await sb.from('werber_links').upsert({ profile_id, werber_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const profile_id = new URL(req.url).searchParams.get('profile_id');
  if (!profile_id) return NextResponse.json({ error: 'profile_id required' }, { status: 400 });
  const sb = await supabaseServer();
  const { error } = await sb.from('werber_links').delete().eq('profile_id', profile_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

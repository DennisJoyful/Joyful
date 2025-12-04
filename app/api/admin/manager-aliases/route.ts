import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/getProfile';

export async function GET() {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const sb = await supabaseServer();
  const { data, error } = await sb.from('manager_aliases').select('alias, manager_profile_id').order('alias');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json();
  const { alias, manager_profile_id } = body;
  if (!alias || !manager_profile_id) return NextResponse.json({ error: 'alias and manager_profile_id required' }, { status: 400 });
  const sb = await supabaseServer();
  const { error } = await sb.from('manager_aliases').upsert({ alias, manager_profile_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const alias = new URL(req.url).searchParams.get('alias');
  if (!alias) return NextResponse.json({ error: 'alias required' }, { status: 400 });
  const sb = await supabaseServer();
  const { error } = await sb.from('manager_aliases').delete().eq('alias', alias);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

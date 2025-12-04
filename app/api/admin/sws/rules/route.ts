import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/getProfile';

export async function GET() {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const sb = await supabaseServer();
  const { data, error } = await sb.from('reward_rules').select('key, points').order('key');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json();
  const items = body.items as { key: string; points: number }[];
  const sb = await supabaseServer();
  for (const it of items) {
    await sb.from('reward_rules').upsert({ key: it.key, points: it.points });
  }
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/getProfile';

export async function POST(req: NextRequest) {
  const { user, profile } = await getProfile();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  const code = body.code as string;
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });

  const sb = await supabaseServer();
  const { data: w } = await sb.from('werber').select('id, ref_code').eq('ref_code', code).maybeSingle();
  if (!w) return NextResponse.json({ error: 'ungültiger code' }, { status: 400 });

  // set role to werber if not already
  await sb.from('profiles').update({ role: 'werber' }).eq('id', profile?.id ?? user.id);

  // link profile -> werber
  await sb.from('werber_links').upsert({ profile_id: profile?.id ?? user.id, werber_id: w.id });

  return NextResponse.json({ ok: true, werber_id: w.id });
}

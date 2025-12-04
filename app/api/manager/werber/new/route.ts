import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/getProfile';

function genCode(len=10) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s=''; for (let i=0;i<len;i++) s += alphabet[Math.floor(Math.random()*alphabet.length)];
  return s;
}

export async function POST(req: NextRequest) {
  const { user, profile } = await getProfile();
  if (!user || (profile?.role !== 'manager' && profile?.role !== 'admin')) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json();
  const { name } = body;
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const sb = await supabaseServer();
  // 1) create werber row
  const { data: w, error: werr } = await sb.from('werber').insert({ name, manager_id: profile?.id, ref_code: genCode(8) }).select('*').single();
  if (werr) return NextResponse.json({ error: werr.message }, { status: 500 });

  // 2) referral_codes entry (type 'werber')
  const code = w.ref_code;
  const { error: rcerr } = await sb.from('referral_codes').upsert({
    code, type: 'werber', manager_id: profile?.id, werber_id: null
  });
  if (rcerr) return NextResponse.json({ error: rcerr.message }, { status: 500 });

  const link = `/sws/apply/${code}`;
  return NextResponse.json({ ok: true, werber: w, code, link });
}

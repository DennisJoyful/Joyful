import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

async function validateHandleServer(handle: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/validate/handle?handle=${encodeURIComponent(handle)}`, { cache: 'no-store' });
    if (!res.ok) return false;
    const j = await res.json();
    return !!j.exists;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { handle, code, contact, followers, plannedHours } = body;
    if (!handle || !code) return NextResponse.json({ error: 'handle and code required' }, { status: 400 });

    // enforce server-side handle validation
    const valid = await validateHandleServer(String(handle).replace(/^@/, ''));
    if (!valid) return NextResponse.json({ error: 'TikTok-Handle konnte nicht verifiziert werden.' }, { status: 400 });

    const sb = await supabaseServer();
    // resolve werber via code
    const { data: ref } = await sb.from('werber').select('id, ref_code, manager_id').eq('ref_code', code).maybeSingle();
    if (!ref) return NextResponse.json({ error: 'invalid code' }, { status: 400 });

    const notesParts = [];
    if (contact) notesParts.push('Kontakt: ' + contact);
    if (followers != null) notesParts.push('Follower: ' + followers);
    if (plannedHours != null) notesParts.push('PlannedHours: ' + plannedHours);
    notesParts.push('ReferralCode: ' + code);

    const { error } = await sb.from('leads').insert({
      creator_handle: String(handle).replace(/^@/, ''),
      source: 'werber_form',
      manager_id: ref.manager_id,
      werber_id: ref.id,
      notes: notesParts.join(' | '),
      status: 'not_contacted'
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

function isValidTikTokProfileUrl(u: string): boolean {
  try {
    const url = new URL(u);
    return url.protocol === 'https:' && url.hostname === 'www.tiktok.com' && url.pathname.includes('/@');
  } catch {
    return false;
  }
}

function extractHandle(u: string): string | null {
  try {
    const url = new URL(u);
    const after = url.pathname.split('/@')[1] || '';
    const handle = after.split(/[/?#]/)[0];
    return handle || null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { handle, profile_url, code, contact, followers, plannedHours } = body;

    if (!handle) return NextResponse.json({ error: 'Handle fehlt.' }, { status: 400 });
    if (!profile_url) return NextResponse.json({ error: 'Profil-URL fehlt.' }, { status: 400 });
    if (!isValidTikTokProfileUrl(String(profile_url))) return NextResponse.json({ error: 'Ungültige TikTok-URL.' }, { status: 400 });

    const normHandle = String(handle).replace(/^@/, '').trim().toLowerCase();
    const urlHandle = (extractHandle(String(profile_url)) || '').toLowerCase();
    if (!urlHandle || urlHandle !== normHandle) return NextResponse.json({ error: 'Profil-URL passt nicht zum Handle.' }, { status: 400 });

    const sb = await supabaseServer();
    // resolve werber via code
    const { data: ref } = await sb.from('werber').select('id, ref_code, manager_id').eq('ref_code', code).maybeSingle();
    if (!ref) return NextResponse.json({ error: 'Ungültiger Referral-Code.' }, { status: 400 });

    const notesParts = [];
    if (contact) notesParts.push('Kontakt: ' + contact);
    if (followers != null) notesParts.push('Follower: ' + followers);
    if (plannedHours != null) notesParts.push('PlannedHours: ' + plannedHours);
    notesParts.push('ProfileURL: ' + profile_url);
    notesParts.push('ReferralCode: ' + code);

    const { error } = await sb.from('leads').insert({
      creator_handle: normHandle,
      source: 'werber_form',
      manager_id: ref.manager_id,
      werber_id: ref.id,
      notes: notesParts.join(' | '),
      status: 'not_contacted'
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}

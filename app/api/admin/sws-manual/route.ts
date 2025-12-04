import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/getProfile';

export async function POST(req: NextRequest) {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { werberId, creatorId, month, points, reason } = body;
    if (!werberId || !month || !points || !reason) {
      return NextResponse.json({ error: 'werberId, month, points, reason required' }, { status: 400 });
    }
    const sb = await supabaseServer();
    const { error } = await sb.from('points_ledger').insert({
      werber_id: werberId,
      creator_id: creatorId ?? null,
      month,
      points,
      reason,
      date: month
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

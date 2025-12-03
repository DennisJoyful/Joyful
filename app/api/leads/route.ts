// app/api/leads/route.ts (uses Supabase, falls back to empty)
import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('id, creator_handle, status, source, contact_date, follow_up_date, live_status');
    if (error) throw error;
    return NextResponse.json({ rows: data || [] });
  } catch (e) {
    console.warn('[api/leads] fallback because', e);
    return NextResponse.json({ rows: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, data } = body || {};
    if (!id || !data) return NextResponse.json({ ok: false }, { status: 400 });
    const { error } = await supabase.from('leads').update(data).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.warn('[api/leads] update fallback', e);
    return NextResponse.json({ ok: false, msg: 'update failed (check Supabase env & table)' }, { status: 500 });
  }
}

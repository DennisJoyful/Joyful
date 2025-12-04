import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: null });

    const batch: any[] = [];
    for (const r of rows) {
      const creator_id = String(r.creator_id ?? r.CreatorID ?? '').trim();
      const m = String(r.month ?? r.Month ?? '').trim();
      if (!creator_id || !m) continue;
      const month = (m.length === 7 ? `${m}-01` : m);
      batch.push({
        creator_id,
        month,
        days_streamed: Number(r.days_streamed ?? r.Days ?? 0),
        hours_streamed: Number(r.hours_streamed ?? r.Hours ?? 0),
        minutes_streamed: Number(r.minutes_streamed ?? r.Minutes ?? 0),
        diamonds: Number(r.diamonds ?? r.Diamonds ?? 0),
        rookie: Boolean(r.rookie ?? r.Rookie ?? false)
      });
    }

    const sb = supabaseServer();
    const { error } = await sb.from('tiktok_monthly').upsert(batch, { onConflict: 'creator_id,month' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await sb.rpc('refresh_mv_active_7_15');
    return NextResponse.json({ ok: true, count: batch.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

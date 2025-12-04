import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';
import { parseDurationToHours, parseMonthToISO, getVal } from '@/lib/import/parsers';

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

    const batchMonthly: any[] = [];
    const updateStreamer: any[] = [];
    let skipped = 0;

    for (const r of rows) {
      const creatorId = (getVal(r, ['Creator*in-ID','Creator-in-ID','Creator ID','CreatorID','creator_id']) ?? '').toString().trim();
      const handle = (getVal(r, ['Creator*innen-Anmeldename','Creator-innen-Anmeldename','Anmeldename','Handle','creator_handle']) ?? '').toString().trim();
      const joinRaw = getVal(r, ['Beitrittszeit','Join Date','Beitritt','join_date']);
      const diamondsRaw = getVal(r, ['Diamanten','Diamonds','diamonds']);
      const durationRaw = getVal(r, ['Live-Dauer','Live Dauer','Dauer','hours_streamed','Minuten','Stunden']);
      const daysRaw = getVal(r, ['Gültige Live Gehen Tage','Live Tage','Tage','days_streamed']);
      const status = getVal(r, ['graduierungsstatus','Graduierungsstatus','Status']);

      if (!creatorId) { skipped++; continue; }

      // Month: try from separate header if present, else current month fallback
      const monthRaw = getVal(r, ['Datenzeitraum','Monat','month']);
      const monthISO = parseMonthToISO(monthRaw ?? new Date().toISOString().slice(0,7));
      if (!monthISO) { skipped++; continue; }

      const hours = parseDurationToHours(durationRaw);
      const days = Number(daysRaw ?? 0);
      const diamonds = Number(diamondsRaw ?? 0);

      batchMonthly.push({
        creator_id: creatorId,
        month: monthISO,
        days_streamed: Number.isFinite(days) ? days : 0,
        hours_streamed: Number.isFinite(hours) ? hours : 0,
        minutes_streamed: 0,
        diamonds: Number.isFinite(diamonds) ? diamonds : 0,
        rookie: String(status ?? '').toLowerCase().includes('anfänger') // heuristic
      });

      if (handle || joinRaw) {
        let joinDate: string | null = null;
        try {
          const d = new Date(joinRaw);
          if (!isNaN(d.getTime())) {
            joinDate = d.toISOString().slice(0,10);
          }
        } catch {}
        updateStreamer.push({ creator_id: creatorId, creator_handle: handle || null, join_date: joinDate });
      }
    }

    const sb = await supabaseServer();

    if (batchMonthly.length) {
      const { error } = await sb.from('tiktok_monthly').upsert(batchMonthly, { onConflict: 'creator_id,month' });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Upsert streamer basics (handle, join_date if null)
    for (const u of updateStreamer) {
      if (!u.creator_id) continue;
      // If streamer exists, only set handle if empty, join_date if null
      const { data: exist } = await sb.from('streamer').select('creator_id, creator_handle, join_date').eq('creator_id', u.creator_id).maybeSingle();
      if (!exist) {
        await sb.from('streamer').insert({ creator_id: u.creator_id, creator_handle: u.creator_handle, join_date: u.join_date });
      } else {
        await sb.from('streamer').update({
          creator_handle: exist.creator_handle || u.creator_handle || exist.creator_handle,
          join_date: exist.join_date || u.join_date || exist.join_date
        }).eq('creator_id', u.creator_id);
      }
    }

    // Refresh MV from ZIP 2 if present
    await sb.rpc('refresh_mv_active_7_15').catch(() => {});

    return NextResponse.json({ ok: true, inserted_monthly: batchMonthly.length, streamer_updates: updateStreamer.length, skipped });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

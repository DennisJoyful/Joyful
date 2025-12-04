import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';
import { getVal } from '@/lib/import/parsers';

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

    const sb = await supabaseServer();
    let streamerUpserts = 0;

    for (const r of rows) {
      const creatorId = (getVal(r, ['Creator*in-ID','Creator-in-ID','Creator ID','CreatorID','creator_id']) ?? '').toString().trim();
      if (!creatorId) continue;
      const handle = (getVal(r, ['Creator*innen-Anmeldename','Anmeldename','Handle','creator_handle']) ?? '').toString().trim();
      const lastStream = getVal(r, ['Letzter Stream','letzter stream','Last Stream']);
      const agent = (getVal(r, ['Agent','Manager','Betreuer']) ?? '').toString().trim();

      // Upsert minimal streamer record
      const { data: exist } = await sb.from('streamer').select('creator_id, creator_handle').eq('creator_id', creatorId).maybeSingle();
      if (!exist) {
        await sb.from('streamer').insert({ creator_id: creatorId, creator_handle: handle || null });
      } else if (!exist.creator_handle && handle) {
        await sb.from('streamer').update({ creator_handle: handle }).eq('creator_id', creatorId);
      }
      streamerUpserts++;
      // TODO:
      // - lastStream persistieren: benötigt Spalte (z. B. streamer.last_stream_at)
      // - agent -> assigned_manager_id Mapping (braucht Mapping-Tabelle Name->profile_id)
    }

    return NextResponse.json({ ok: true, streamer_upserts: streamerUpserts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

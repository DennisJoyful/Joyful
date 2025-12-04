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
    let managerMatches = 0;

    for (const r of rows) {
      const creatorId = (getVal(r, ['Creator*in-ID','Creator-in-ID','Creator ID','CreatorID','creator_id']) ?? '').toString().trim();
      if (!creatorId) continue;
      const handle = (getVal(r, ['Creator*innen-Anmeldename','Anmeldename','Handle','creator_handle']) ?? '').toString().trim();
      const lastStreamRaw = getVal(r, ['Letzter Stream','letzter stream','Last Stream']);
      const agent = (getVal(r, ['Agent','Manager','Betreuer']) ?? '').toString().trim();

      // Parse last stream date/time
      let last_stream_at: string | null = null;
      if (lastStreamRaw) {
        const d = new Date(String(lastStreamRaw));
        if (!isNaN(d.getTime())) last_stream_at = d.toISOString();
      }

      // Upsert streamer
      const { data: exist } = await sb.from('streamer').select('creator_id, creator_handle, last_stream_at, assigned_manager_id').eq('creator_id', creatorId).maybeSingle();
      if (!exist) {
        await sb.from('streamer').insert({ creator_id: creatorId, creator_handle: handle || null, last_stream_at });
      } else {
        await sb.from('streamer').update({
          creator_handle: exist.creator_handle || handle || exist.creator_handle,
          last_stream_at: exist.last_stream_at || last_stream_at || exist.last_stream_at
        }).eq('creator_id', creatorId);
      }
      streamerUpserts++;

      // Map agent alias to manager profile
      if (agent) {
        const { data: alias } = await sb.from('manager_aliases').select('manager_profile_id').eq('alias', agent).maybeSingle();
        if (alias?.manager_profile_id) {
          await sb.from('streamer').update({ assigned_manager_id: alias.manager_profile_id }).eq('creator_id', creatorId);
          managerMatches++;
        }
      }
    }

    return NextResponse.json({ ok: true, streamer_upserts: streamerUpserts, manager_matches: managerMatches });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

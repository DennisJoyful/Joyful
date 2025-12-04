import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const sb = await supabaseServer();
    const body = await req.json();
    // Optional: Tabelle apply_telemetry (t: number, type: text, slug: text, handle: text, ua: text, created_at timestamp)
    const { error } = await sb.from('apply_telemetry').insert({
      t: body?.t || Date.now(),
      type: 'success',
      slug: body?.slug || null,
      handle: body?.handle || null,
      ua: body?.ua || null
    });
    // Falls Tabelle nicht existiert, ignorieren
    return NextResponse.json({ ok: true, stored: !error });
  } catch {
    return NextResponse.json({ ok: true, stored: false });
  }
}

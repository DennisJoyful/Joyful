import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const sb = await supabaseServer();
    const body = await req.json();
    const { error } = await sb.from('apply_telemetry').insert({
      t: body?.t || Date.now(),
      type: 'abandon',
      slug: body?.slug || null,
      handle: body?.handle || null,
      ua: body?.ua || null
    });
    return NextResponse.json({ ok: true, stored: !error });
  } catch {
    return NextResponse.json({ ok: true, stored: false });
  }
}

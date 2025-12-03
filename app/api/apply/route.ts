// app/api/apply/route.ts
import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { type, ref, name, handle } = await req.json();
    if (!type || !handle) return NextResponse.json({ ok: false, error: 'missing type/handle' }, { status: 400 });

    // call SQL function if present, else simple insert
    const { data: fnData, error: fnError } = await supabase.rpc('upsert_lead_from_application', {
      p_type: type, p_ref: ref, p_name: name, p_handle: handle
    });

    if (fnError) {
      console.warn('[apply] rpc failed, fallback insert', fnError);
      const { error: insErr } = await supabase.from('leads')
        .insert({ creator_handle: handle, status: 'keine reaktion', source: type });
      if (insErr) throw insErr;
      return NextResponse.json({ ok: true, via: 'fallback' });
    }
    return NextResponse.json({ ok: true, id: fnData });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'apply failed' }, { status: 500 });
  }
}

// app/api/apply/route.ts
import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function POST(req: Request) {
  const { type, ref, name, handle } = await req.json();
  if (!type || !handle) return NextResponse.json({ ok: false, error: 'missing type/handle' }, { status: 400 });
  const { data, error } = await supabase.rpc('upsert_lead_from_application', {
    p_type: type, p_ref: ref, p_name: name, p_handle: handle
  });
  if (error) {
    // fallback: simple insert
    await supabase.from('leads').insert({ creator_handle: handle, status: 'keine reaktion', source: type });
    return NextResponse.json({ ok: true, via: 'fallback' });
  }
  return NextResponse.json({ ok: true, id: data });
}

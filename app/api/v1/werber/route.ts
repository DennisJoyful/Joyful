// app/api/v1/werber/route.ts
import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET() {
  const { data, error } = await supabase.from('werber').select('id,name,ref_code,manager_id');
  if (error) return NextResponse.json({ rows: [], error: error.message }, { status: 500 });
  const rows = (data || []).map(w => ({
    id: w.id, name: w.name, ref: `/apply/sws?ref=${w.ref_code}`, count: 0, points: 0, manager_id: w.manager_id
  }));
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, ref_code, manager_id } = body || {};
  if (!name || !ref_code) return NextResponse.json({ ok: false, error: 'name/ref_code required' }, { status: 400 });
  const { error } = await supabase.from('werber').insert({ name, ref_code, manager_id });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

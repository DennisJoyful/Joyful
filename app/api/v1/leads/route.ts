// app/api/v1/leads/route.ts
import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET() {
  const { data, error } = await supabase
    .from('leads')
    .select('id, creator_handle, status, source, contact_date, follow_up_date, live_status')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ rows: [], error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data || [] });
}

export async function POST(req: Request) {
  const { id, data } = await req.json();
  if (!id || !data) return NextResponse.json({ ok: false, error: 'missing id/data' }, { status: 400 });
  const { error } = await supabase.from('leads').update(data).eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

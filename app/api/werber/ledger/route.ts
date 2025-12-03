// app/api/werber/ledger/route.ts
import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wid = url.searchParams.get('id'); // werber id
  if (!wid) return NextResponse.json({ rows: [] });
  try {
    const { data, error } = await supabase
      .from('points_ledger')
      .select('id,date,points,reason')
      .eq('werber_id', wid)
      .order('date', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ rows: data || [] });
  } catch (e) {
    console.warn('[api/werber/ledger] fallback', e);
    return NextResponse.json({ rows: [] });
  }
}

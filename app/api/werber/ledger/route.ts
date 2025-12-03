// app/api/werber/ledger/route.ts
import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const wid = url.searchParams.get('id');
  if (!wid) return NextResponse.json({ rows: [] });
  const { data, error } = await supabase
    .from('points_ledger')
    .select('id, points, reason, date, created_at')
    .eq('werber_id', wid)
    .order('date', { ascending: true });
  if (error) return NextResponse.json({ rows: [] });
  const rows = (data || []).map((r: any) => ({
    id: r.id, date: r.date || (r.created_at?.slice(0,10)), points: r.points, reason: r.reason
  }));
  return NextResponse.json({ rows });
}

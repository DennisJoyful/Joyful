// app/api/werber/route.ts
import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('werber')
      .select('id, name, ref_code');
    if (error) throw error;

    // compute counts and mock points (replace by SQL later)
    const rows = (data || []).map(w => ({
      id: w.id, name: w.name, ref: `/apply/sws?ref=${w.ref_code}`, points: 0, count: 0
    }));
    return NextResponse.json({ rows });
  } catch (e) {
    console.warn('[api/werber] fallback', e);
    return NextResponse.json({ rows: [] });
  }
}

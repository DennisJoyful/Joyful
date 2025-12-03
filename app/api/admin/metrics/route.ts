// app/api/admin/metrics/route.ts
import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET() {
  const { data, error } = await supabase.from('leads').select('status, manager_id');
  if (error) return NextResponse.json({ byStatus: {}, byManager: {} }, { status: 500 });
  const byStatus: Record<string, number> = {};
  const byManager: Record<string, number> = {};
  for (const r of data || []) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    const m = r.manager_id || 'unassigned';
    byManager[m] = (byManager[m] || 0) + 1;
  }
  return NextResponse.json({ byStatus, byManager });
}

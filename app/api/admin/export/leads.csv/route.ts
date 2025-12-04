import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/getProfile';

export async function GET() {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return new NextResponse('forbidden', { status: 403 });

  const sb = await supabaseServer();
  const { data } = await sb.from('leads').select('id, creator_handle, status, source, manager_id, created_at, contact_date, follow_up_date');
  const headers = ['id','creator_handle','status','source','manager_id','created_at','contact_date','follow_up_date'];
  const lines = [
    headers.join(','),
    ...(data ?? []).map((r:any)=> headers.map(h => (r[h] ?? '')).join(','))
  ].join('\n');

  return new NextResponse(lines, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="leads.csv"' } });
}

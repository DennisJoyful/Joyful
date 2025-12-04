import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/getProfile';

function plusDays(dateStr: string, add: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + add);
  return d.toISOString().slice(0,10);
}

export async function POST(req: NextRequest) {
  const { user, profile } = await getProfile();
  if (!user || (profile?.role !== 'manager' && profile?.role !== 'admin')) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json();
  const { id, status, contact } = body as { id: string; status?: string; contact?: boolean };

  const sb = await supabaseServer();

  // verify ownership
  const { data: lead } = await sb.from('leads').select('id, manager_id, status, contact_date, follow_up_date, creator_handle, live_status, source, created_at').eq('id', id).maybeSingle();
  if (!lead) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (profile?.role === 'manager' && lead.manager_id !== profile?.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const patch: any = {};
  if (status) patch.status = status;
  if (contact) {
    const today = new Date().toISOString().slice(0,10);
    patch.contact_date = today;
    patch.follow_up_date = plusDays(today, 5);
  }

  const { data, error } = await sb.from('leads').update(patch).eq('id', id).select('id, creator_handle, source, status, contact_date, follow_up_date, live_status, created_at').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, lead: data });
}

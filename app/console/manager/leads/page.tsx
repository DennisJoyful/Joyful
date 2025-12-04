import { supabaseServer } from '@/lib/supabase/server';
import { requireManager } from '@/lib/auth/guards';
import LeadsClient from './ui/LeadsClient';

export default async function ManagerLeadsPage(props: { searchParams: Promise<{ status?: string; source?: string; q?: string; follow?: string }> }) {
  const guarded = await requireManager(<ManagerLeadsInner searchParams={props.searchParams} />);
  return guarded;
}

async function ManagerLeadsInner({ searchParams }: { searchParams: Promise<{ status?: string; source?: string; q?: string; follow?: string }> }) {
  const { status, source, q, follow } = await searchParams;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  let query = sb
    .from('leads')
    .select('id, creator_handle, source, status, contact_date, follow_up_date, live_status, created_at')
    .eq('manager_id', user?.id)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (source) query = query.eq('source', source);
  if (q) query = query.ilike('creator_handle', `%${q}%`);
  if (follow === 'due') {
    const today = new Date().toISOString().slice(0,10);
    query = query.lte('follow_up_date', today).not('follow_up_date', 'is', null);
  }

  const { data: leads } = await query.limit(300);

  return <LeadsClient initialLeads={leads ?? []} />;
}

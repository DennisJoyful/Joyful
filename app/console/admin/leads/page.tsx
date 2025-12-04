import { supabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/guards';
import { Table } from '@/components/Table';

export default async function AdminLeadsPage(props: { searchParams: Promise<{ status?: string; source?: string }> }) {
  const guarded = await requireAdmin(<AdminLeadsInner searchParams={props.searchParams} />);
  return guarded;
}

async function AdminLeadsInner({ searchParams }: { searchParams: Promise<{ status?: string; source?: string }> }) {
  const { status, source } = await searchParams;
  const sb = await supabaseServer();
  let query = sb.from('leads').select('id, creator_handle, source, status, manager_id, created_at');
  if (status) query = query.eq('status', status);
  if (source) query = query.eq('source', source);
  const { data: leads } = await query.order('created_at', { ascending: false }).limit(500);

  // group by manager
  const byMgr: Record<string, number> = {};
  for (const l of (leads ?? [])) byMgr[l.manager_id ?? 'unassigned'] = (byMgr[l.manager_id ?? 'unassigned'] ?? 0) + 1;
  const rows = Object.entries(byMgr).map(([k, v]) => [k, v]);

  return (
    <div className="grid gap-6">
      <div className="card">
        <h1 className="h1">Leads (global)</h1>
        <p className="text-sm text-gray-600">Gruppiert nach Manager-ID</p>
        <Table headers={['Manager ID','Anzahl Leads']} rows={rows} />
      </div>
    </div>
  );
}

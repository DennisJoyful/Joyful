import { supabaseServer } from '@/lib/supabase/server';
import { KPI } from '@/components/KPI';
import { Table } from '@/components/Table';

export default async function AdminDashboardPage() {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return <div className="card">Bitte einloggen</div>;

  const [{ data: leads }, { data: ledger }] = await Promise.all([
    sb.from('leads').select('id, status, manager_id, created_at'),
    sb.from('points_ledger').select('id, points, werber_id')
  ]);

  const totalLeads = (leads ?? []).length;
  const contacted = (leads ?? []).filter(l => l.status !== 'not_contacted').length;
  const pointsTotal = (ledger ?? []).reduce((s, x) => s + (x.points ?? 0), 0);

  const statusCount: Record<string, number> = {};
  for (const l of (leads ?? [])) statusCount[l.status] = (statusCount[l.status] ?? 0) + 1;
  const statusTable = <Table headers={['Status','Anzahl']} rows={Object.entries(statusCount).map(([k,v]) => [k, v])} />;

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-3 gap-4">
        <KPI label="Leads gesamt" value={totalLeads} />
        <KPI label="Leads kontaktiert" value={contacted} />
        <KPI label="Vergebene Punkte" value={pointsTotal} />
      </div>
      <div className="card">
        <h2 className="h2 mb-3">Leads nach Status</h2>
        {statusTable}
      </div>
    </div>
  );
}

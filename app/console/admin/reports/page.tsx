import { supabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/guards';
import { Table } from '@/components/Table';

export default async function ReportsPage() {
  const guarded = await requireAdmin(<ReportsInner />);
  return guarded;
}

async function ReportsInner() {
  const sb = await supabaseServer();
  const { data: leads } = await sb.from('leads').select('id, status, manager_id');
  const { data: ledger } = await sb.from('points_ledger').select('id, points, werber_id');

  const byStatus: Record<string, number> = {};
  for (const l of (leads ?? [])) byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;

  const pointsByWerber: Record<string, number> = {};
  for (const p of (ledger ?? [])) pointsByWerber[p.werber_id ?? 'unknown'] = (pointsByWerber[p.werber_id ?? 'unknown'] ?? 0) + (p.points ?? 0);

  return (
    <div className="grid gap-6">
      <div className="card">
        <h2 className="h2 mb-2">Leads nach Status</h2>
        <Table headers={['Status','Anzahl']} rows={Object.entries(byStatus)} />
      </div>
      <div className="card">
        <h2 className="h2 mb-2">Punkte nach Werber</h2>
        <Table headers={['Werber ID','Punkte']} rows={Object.entries(pointsByWerber)} />
      </div>
    </div>
  );
}

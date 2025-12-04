import { supabaseServer } from '@/lib/supabase/server';
import { requireManager } from '@/lib/auth/guards';
import { Table } from '@/components/Table';

export default async function ManagerSWSPage() {
  const guarded = await requireManager(<ManagerSWSInner />);
  return guarded;
}

async function ManagerSWSInner() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  const { data: pts } = await sb
    .from('points_ledger')
    .select('date, month, points, reason, creator_id')
    .order('date', { ascending: false })
    .limit(200);

  const balance = (pts ?? []).reduce((s,x)=> s + (x.points ?? 0), 0);

  const { data: streamers } = await sb
    .from('streamer')
    .select('creator_id, creator_handle, assigned_manager_id, assigned_werber_id')
    .eq('assigned_manager_id', user?.id);

  return (
    <div className="grid gap-6">
      <div className="card">
        <h1 className="h1">SWS Überblick</h1>
        <div className="text-sm text-gray-600">Punkte (global, gefiltert folgt im nächsten Schritt)</div>
        <div className="text-3xl font-semibold mt-2">{balance}</div>
      </div>
      <div className="card">
        <h2 className="h2 mb-2">Kontoauszug</h2>
        <Table headers={['Datum','Monat','Grund','Punkte','Creator']} rows={(pts ?? []).map(p => [p.date, p.month, p.reason, p.points, p.creator_id ?? '-'])} />
      </div>
      <div className="card">
        <h2 className="h2 mb-2">Meine Geworbenen / Betreuten</h2>
        <Table headers={['Handle','Creator ID']} rows={(streamers ?? []).map(s => [s.creator_handle, s.creator_id])} />
      </div>
    </div>
  );
}

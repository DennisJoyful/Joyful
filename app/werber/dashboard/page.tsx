import { supabaseServer } from '@/lib/supabase/server';
import { Table } from '@/components/Table';

export default async function WerberDashboardPage() {
  const sb = await supabaseServer(); // <-- await fixes Promise type
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return <div className="card">Bitte einloggen</div>;

  const { data: ledger } = await sb
    .from('points_ledger')
    .select('date, points, reason, creator_id, month')
    .eq('werber_id', user.id)
    .order('date', { ascending: false })
    .limit(200);

  const balance = (ledger ?? []).reduce((s,x)=> s + (x.points ?? 0), 0);

  const { data: streamers } = await sb
    .from('streamer')
    .select('creator_id, creator_handle, assigned_werber_id')
    .eq('assigned_werber_id', user.id);

  return (
    <div className="grid gap-6">
      <div className="card">
        <h1 className="h1">Punktestand</h1>
        <div className="text-3xl font-semibold mt-2">{balance}</div>
      </div>
      <div className="card">
        <h2 className="h2 mb-3">Kontoauszug</h2>
        <Table headers={['Datum','Monat','Grund','Punkte','Streamer']} rows={(ledger ?? []).map(l => [
          l.date ?? '-', l.month ?? '-', l.reason, l.points, l.creator_id ?? '-'
        ])} />
      </div>
      <div className="card">
        <h2 className="h2 mb-3">Geworbene</h2>
        <Table headers={['Handle','TikTok']} rows={(streamers ?? []).map(s => [
          s.creator_handle, <a key={s.creator_id} className="underline" target="_blank" href={`https://www.tiktok.com/@${s.creator_handle}`}>Profil</a>
        ])} />
      </div>
    </div>
  );
}

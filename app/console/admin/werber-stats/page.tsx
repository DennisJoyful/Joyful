import { supabaseServer } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/guards';
import { Table } from '@/components/Table';

export default async function WerberStatsPage() {
  const guarded = await requireAdmin(<WerberStatsInner />);
  return guarded;
}

async function WerberStatsInner() {
  const sb = await supabaseServer();
  const { data: leads } = await sb.from('leads').select('id, werber_id, status');
  const { data: werber } = await sb.from('werber').select('id, name, ref_code');

  const byWerber: Record<string, { total: number; joined: number; name: string; ref_code: string }> = {};
  for (const w of (werber ?? [])) {
    byWerber[w.id] = { total: 0, joined: 0, name: w.name, ref_code: w.ref_code };
  }
  for (const l of (leads ?? [])) {
    if (!l.werber_id) continue;
    const bucket = byWerber[l.werber_id] || (byWerber[l.werber_id] = { total: 0, joined: 0, name: 'Unbekannt', ref_code: '' });
    bucket.total += 1;
    if (l.status === 'joined') bucket.joined += 1;
  }

  const rows = Object.entries(byWerber).map(([werberId, v]) => {
    const rate = v.total ? Math.round((v.joined / v.total) * 100) + '%' : '-';
    return [v.name, werberId, v.ref_code, v.total, v.joined, rate];
  });

  return (
    <div className="card">
      <h1 className="h1">Werber – Bewerbungen & Conversion</h1>
      <Table headers={['Werber','Werber ID','Code','Bewerbungen','Joined','Conversion']} rows={rows} />
    </div>
  );
}

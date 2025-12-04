import { supabaseServer } from '@/lib/supabase/server';
import { Table } from '@/components/Table';
import dayjs from 'dayjs';

export default async function ManagerInactivityPage() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return <div className="card">Bitte einloggen</div>;

  const monthStart = dayjs().startOf('month').format('YYYY-MM-01');

  const { data: streamers } = await sb
    .from('streamer')
    .select('creator_id, creator_handle, assigned_manager_id')
    .eq('assigned_manager_id', user.id);

  const rows: any[] = [];
  for (const s of (streamers ?? [])) {
    const cur = await sb
      .from('v_streamer_monthly')
      .select('month, days_streamed, hours_streamed, diamonds')
      .eq('creator_id', s.creator_id)
      .eq('month', monthStart)
      .maybeSingle();
    const days = cur.data?.days_streamed ?? 0;
    const hours = Number(cur.data?.hours_streamed ?? 0);
    rows.push({
      handle: s.creator_handle,
      days, hours,
      link: `https://www.tiktok.com/@${s.creator_handle}`
    });
  }

  const below715 = rows.filter(r => r.days < 7 || r.hours < 15);
  const table = <Table headers={['Handle','Tage','Std.','Link']} rows={below715.map(r => [r.handle, r.days, r.hours, <a key={r.handle} className="underline" href={r.link} target="_blank">TikTok</a>])} />;

  return (
    <div className="card">
      <h1 className="h1">Inaktivität</h1>
      <p className="text-sm text-gray-600 mt-2">Stream-Zeit im laufenden Monat (Ziel: ≥ 7 Tage & ≥ 15 Stunden)</p>
      <div className="mt-4">{table}</div>
    </div>
  );
}

import { supabaseServer } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/getProfile';

export default async function WerberDashboard() {
  const sb = await supabaseServer();
  const { user, profile } = await getProfile();
  if (!user) return <div className="card">Bitte einloggen</div>;

  // resolve werber id via link
  const { data: link } = await sb.from('werber_links').select('werber_id').eq('profile_id', user.id).maybeSingle();
  if (!link?.werber_id) {
    return (
      <div className="card">
        <div className="font-semibold">Noch kein Werber verknüpft</div>
        <div className="text-sm">Bitte unter <code>/console/werber/claim</code> deinen Referral-Code eingeben.</div>
      </div>
    );
  }
  const werberId = link.werber_id;

  const [{ data: w }, { data: ledger }] = await Promise.all([
    sb.from('werber').select('id, name, ref_code').eq('id', werberId).maybeSingle(),
    sb.from('points_ledger').select('date, points, reason, creator_id, month').eq('werber_id', werberId).order('date', { ascending: false }).limit(200)
  ]);

  const balance = (ledger ?? []).reduce((s,x)=> s + (x.points ?? 0), 0);

  return (
    <div className="grid gap-6">
      <div className="card">
        <div className="text-sm text-gray-500">Willkommen</div>
        <div className="text-2xl font-semibold">{w?.name ?? 'Werber'}</div>
      </div>
      <div className="card">
        <div className="text-sm text-gray-500">Aktueller Punktestand</div>
        <div className="text-3xl font-semibold">{balance}</div>
      </div>
      <div className="card">
        <div className="font-semibold mb-1">Dein Bewerbungslink</div>
        <div className="text-sm">/sws/apply/{w?.ref_code}</div>
        <div className="text-xs text-gray-500">Alle Bewerbungen darüber werden deinem Manager zugeordnet.</div>
      </div>
      <div className="card">
        <div className="font-semibold mb-2">Kontoauszug (letzte 200)</div>
        <div className="grid gap-1">
          {(ledger ?? []).map((l, i) => (
            <div key={i} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <div className="text-xs text-gray-600">{l.date}</div>
              <div className="text-xs">{l.reason}</div>
              <div className="text-xs">{l.creator_id ?? '-'}</div>
              <div className="font-semibold">{l.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { supabaseServer } from '@/lib/supabase/server';
import { requireManager } from '@/lib/auth/guards';

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-1 rounded-lg border text-xs">{children}</span>;
}

export default async function ManagerLeadsPage() {
  const guarded = await requireManager(<ManagerLeadsInner />);
  return guarded;
}

async function ManagerLeadsInner() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  const { data: leads } = await sb
    .from('leads')
    .select('id, creator_handle, source, status, contact_date, follow_up_date, live_status')
    .eq('manager_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="card">
      <h1 className="h1">Meine Leads</h1>
      <p className="text-sm text-gray-600 mt-1">Follow-ups werden automatisch 5 Tage nach Kontakt gesetzt.</p>
      <div className="mt-4 grid gap-2">
        {(leads ?? []).map(l => (
          <div key={l.id} className="flex items-center justify-between border rounded-xl p-3">
            <div className="flex-1">
              <div className="font-medium">@{l.creator_handle}</div>
              <div className="text-xs text-gray-500">
                Kontakt: {l.contact_date ?? '-'} • F-up: {l.follow_up_date ?? '-'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{l.source}</Badge>
              <Badge>{l.status}</Badge>
              <Badge>{l.live_status ?? 'not_checked'}</Badge>
              <a className="btn" href={`https://www.tiktok.com/@${l.creator_handle}`} target="_blank">TikTok</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { supabaseServer } from '@/lib/supabase/server';
import { requireManager } from '@/lib/auth/guards';

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-1 rounded-lg border text-xs">{children}</span>;
}

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

  function Filters() {
    return (
      <form className="flex flex-wrap gap-2 items-end">
        <input name="q" placeholder="@handle" defaultValue={q ?? ''} className="border rounded-xl px-3 py-2" />
        <select name="status" defaultValue={status ?? ''} className="border rounded-xl px-3 py-2">
          <option value="">Status (alle)</option>
          <option value="not_contacted">nicht kontaktiert</option>
          <option value="no_response">keine reaktion</option>
          <option value="invited">eingeladen</option>
          <option value="declined">abgesagt</option>
          <option value="joined">gejoint</option>
        </select>
        <select name="source" defaultValue={source ?? ''} className="border rounded-xl px-3 py-2">
          <option value="">Quelle (alle)</option>
          <option value="self">selbst eingetragen</option>
          <option value="sws">SWS Programm</option>
          <option value="admin">Admin</option>
          <option value="manager_form">Manager Formular</option>
          <option value="werber_form">Werber Formular</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="follow" value="due" defaultChecked={follow==='due'} /> Follow-up fällig
        </label>
        <button className="rounded-2xl px-4 py-2 border">Filtern</button>
      </form>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4">
        <h1 className="h1">Meine Leads</h1>
        <Filters />
      </div>
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

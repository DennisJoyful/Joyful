'use client';
import { useState } from 'react';

type Lead = {
  id: string;
  creator_handle: string;
  source: string;
  status: string;
  contact_date: string | null;
  follow_up_date: string | null;
  live_status: string | null;
  created_at: string;
};

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-1 rounded-lg border text-xs">{children}</span>;
}

export default function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [busy, setBusy] = useState<string>('');

  async function update(id: string, patch: any) {
    setBusy(id);
    const res = await fetch('/api/manager/leads/update', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ id, ...patch }) });
    const j = await res.json();
    if (res.ok) {
      setLeads(ls => ls.map(l => l.id===id ? { ...l, ...j.lead } : l));
    }
    setBusy('');
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4">
        <h1 className="h1">Meine Leads</h1>
        <div className="text-xs text-gray-500">Schnellaktionen: Status + Kontakt</div>
      </div>
      <div className="mt-4 grid gap-2">
        {leads.map(l => (
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
              <div className="flex items-center gap-1">
                <button className="text-xs underline" disabled={busy===l.id} onClick={()=>update(l.id, { status:'invited' })}>eingeladen</button>
                <span className="text-gray-300">|</span>
                <button className="text-xs underline" disabled={busy===l.id} onClick={()=>update(l.id, { status:'declined' })}>abgesagt</button>
                <span className="text-gray-300">|</span>
                <button className="text-xs underline" disabled={busy===l.id} onClick={()=>update(l.id, { status:'joined' })}>gejoint</button>
                <span className="text-gray-300">|</span>
                <button className="text-xs underline" disabled={busy===l.id} onClick={()=>update(l.id, { contact:true })}>Kontakt gesetzt</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

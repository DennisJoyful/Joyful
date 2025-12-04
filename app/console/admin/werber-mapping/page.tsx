'use client';
import { useEffect, useState } from 'react';

export default function WerberMappingPage() {
  const [items, setItems] = useState<{ profile_id: string; werber_id: string }[]>([]);
  const [profileId, setProfileId] = useState('');
  const [werberId, setWerberId] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/werber-links');
    const j = await res.json();
    setItems(j.items ?? []);
  }
  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/admin/werber-links', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ profile_id: profileId, werber_id: werberId }) });
    const j = await res.json();
    setMsg(JSON.stringify(j));
    await load();
  }
  async function del(pid: string) {
    await fetch('/api/admin/werber-links?profile_id='+encodeURIComponent(pid), { method:'DELETE' });
    await load();
  }
  useEffect(()=>{ load(); }, []);

  return (
    <div className="card max-w-2xl">
      <h1 className="h1">Werber-Mapping (profile → werber.id)</h1>
      <form onSubmit={add} className="grid gap-2 mt-3">
        <input className="border rounded-xl px-3 py-2" placeholder="profile_id (uuid)" value={profileId} onChange={e=>setProfileId(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" placeholder="werber_id (uuid)" value={werberId} onChange={e=>setWerberId(e.target.value)} />
        <button className="rounded-2xl px-4 py-2 border">Hinzufügen / Aktualisieren</button>
      </form>
      {msg && <pre className="bg-gray-50 rounded-xl p-2 mt-3 text-xs">{msg}</pre>}
      <div className="mt-4">
        <h2 className="h2 mb-2">Aktuelle Links</h2>
        <ul className="grid gap-1">
          {items.map(it => (
            <li key={it.profile_id} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <div><b>{it.profile_id}</b> → {it.werber_id}</div>
              <button onClick={()=>del(it.profile_id)} className="text-red-600 underline">löschen</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

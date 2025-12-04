'use client';
import { useEffect, useState } from 'react';

type Alias = { alias: string; manager_profile_id: string };

export default function AgentsPage() {
  const [items, setItems] = useState<Alias[]>([]);
  const [alias, setAlias] = useState('');
  const [managerId, setManagerId] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/manager-aliases');
    const j = await res.json();
    setItems(j.items ?? []);
  }
  useEffect(()=>{ load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/admin/manager-aliases', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ alias, manager_profile_id: managerId }) });
    const j = await res.json();
    setMsg(JSON.stringify(j));
    await load();
  }
  async function del(a: string) {
    await fetch('/api/admin/manager-aliases?alias=' + encodeURIComponent(a), { method: 'DELETE' });
    await load();
  }

  return (
    <div className="card max-w-2xl">
      <h1 className="h1">Agent → Manager Mapping</h1>
      <p className="text-sm text-gray-600">Ordnet Agent-Namen aus TikTok-Export einem Manager-Profil (profiles.id) zu.</p>
      <form onSubmit={add} className="grid gap-2 mt-4">
        <input className="border rounded-xl px-3 py-2" placeholder="Agent Alias (z. B. Max M.)" value={alias} onChange={e=>setAlias(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" placeholder="manager_profile_id (uuid)" value={managerId} onChange={e=>setManagerId(e.target.value)} />
        <button className="rounded-2xl px-4 py-2 border">Hinzufügen</button>
      </form>
      {msg && <pre className="text-xs bg-gray-50 p-2 rounded mt-3">{msg}</pre>}
      <div className="mt-4">
        <h2 className="h2">Aktuelle Mappings</h2>
        <ul className="mt-2 grid gap-1">
          {items.map(it => (
            <li key={it.alias} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <div><b>{it.alias}</b> → {it.manager_profile_id}</div>
              <button className="text-red-600 underline" onClick={()=>del(it.alias)}>löschen</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

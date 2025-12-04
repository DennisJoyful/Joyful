'use client';
import { useEffect, useState } from 'react';

export default function RulesPage() {
  const [rows, setRows] = useState<{ key: string; points: number }[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const res = await fetch('/api/admin/sws/rules');
    const j = await res.json();
    setRows(j.items ?? []);
  }
  async function save() {
    setMsg('');
    const res = await fetch('/api/admin/sws/rules', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ items: rows }) });
    const j = await res.json();
    setMsg(JSON.stringify(j));
  }
  useEffect(()=>{ load(); }, []);

  return (
    <div className="card max-w-2xl">
      <h1 className="h1">SWS – Regeln (Punktwerte)</h1>
      <div className="grid gap-2 mt-4">
        {rows.map((r, idx)=> (
          <div key={r.key} className="flex items-center gap-3">
            <div className="w-80 text-sm">{r.key}</div>
            <input className="border rounded-xl px-3 py-2 w-32" type="number" value={r.points}
              onChange={e=>{
                const cp=[...rows]; cp[idx]={...cp[idx], points: Number(e.target.value)}; setRows(cp);
              }} />
          </div>
        ))}
      </div>
      <button className="rounded-2xl px-4 py-2 border mt-3" onClick={save}>Speichern</button>
      {msg && <pre className="bg-gray-50 rounded-xl p-2 mt-3 text-xs">{msg}</pre>}
    </div>
  );
}

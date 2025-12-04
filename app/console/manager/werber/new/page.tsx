'use client';
import { useState } from 'react';

export default function NewWerberPage() {
  const [name, setName] = useState('');
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState<string>('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setRes(null);
    const r = await fetch('/api/manager/werber/new', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ name }) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error || 'Fehler'); return; }
    setRes(j);
  }

  return (
    <div className="card max-w-xl">
      <h1 className="h1">Werber anlegen</h1>
      <form onSubmit={submit} className="grid gap-2 mt-3">
        <input className="border rounded-xl px-3 py-2" placeholder="Name des Werbers" value={name} onChange={e=>setName(e.target.value)} />
        <button className="rounded-2xl px-4 py-2 border">Anlegen</button>
      </form>
      {err && <div className="text-red-600 mt-3 text-sm">{err}</div>}
      {res && (
        <div className="mt-4 text-sm">
          <div><b>Referral-Code:</b> {res.code}</div>
          <div><b>Bewerbungslink:</b> {res.link}</div>
          <div className="text-xs text-gray-500 mt-2">Diesen Link an den Werber senden. Bewerbungen über diesen Link landen beim Manager.</div>
        </div>
      )}
    </div>
  );
}

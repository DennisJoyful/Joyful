'use client';

import { useState } from 'react';

export default function AdminSWSManualPage() {
  const [werberId, setWerberId] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [month, setMonth] = useState('');
  const [points, setPoints] = useState<number>(0);
  const [reason, setReason] = useState('manual_adjustment');
  const [msg, setMsg] = useState<string>('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/admin/sws-manual', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ werberId, creatorId: creatorId || null, month, points: Number(points), reason })
    });
    const j = await res.json();
    setMsg(JSON.stringify(j, null, 2));
  }

  return (
    <div className="card max-w-xl">
      <h1 className="h1">SWS – Manuelle Gutschrift</h1>
      <p className="text-sm text-gray-600 mt-1">Nur Admin. Schreibt in <code>points_ledger</code>.</p>
      <form onSubmit={submit} className="grid gap-3 mt-4">
        <input className="border rounded-xl px-3 py-2" placeholder="werber_id (uuid)" value={werberId} onChange={e=>setWerberId(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" placeholder="creator_id (optional)" value={creatorId} onChange={e=>setCreatorId(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" placeholder="Monat YYYY-MM-01" value={month} onChange={e=>setMonth(e.target.value)} />
        <input className="border rounded-xl px-3 py-2" type="number" placeholder="Punkte" value={points} onChange={e=>setPoints(Number(e.target.value))} />
        <input className="border rounded-xl px-3 py-2" placeholder="Grund" value={reason} onChange={e=>setReason(e.target.value)} />
        <button className="btn">Gutschreiben</button>
      </form>
      {msg && <pre className="bg-gray-50 rounded-xl p-3 mt-4 text-xs overflow-auto">{msg}</pre>}
    </div>
  );
}

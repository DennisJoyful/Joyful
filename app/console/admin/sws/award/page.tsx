'use client';
import { useState } from 'react';

export default function AwardPage() {
  const [month, setMonth] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [msg, setMsg] = useState('');

  async function runPreview(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/admin/sws-award', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ month, commit:false }) });
    const j = await res.json();
    setPreview(j);
  }
  async function runCommit() {
    setMsg('');
    const res = await fetch('/api/admin/sws-award', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ month, commit:true }) });
    const j = await res.json();
    setMsg(JSON.stringify(j, null, 2));
  }

  return (
    <div className="card max-w-3xl">
      <h1 className="h1">SWS – Auto Award</h1>
      <form onSubmit={runPreview} className="grid gap-2 mt-3">
        <input className="border rounded-xl px-3 py-2" placeholder="Monat (YYYY-MM-01)" value={month} onChange={e=>setMonth(e.target.value)} />
        <button className="rounded-2xl px-4 py-2 border">Preview berechnen</button>
      </form>
      {preview && (
        <div className="mt-4">
          <div className="text-sm text-gray-600">toInsert: {preview.toInsertCount} | problems: {preview.problems?.length ?? 0}</div>
          <pre className="bg-gray-50 rounded-xl p-3 mt-2 text-xs overflow-auto">
            {JSON.stringify(preview, null, 2)}
          </pre>
          <button className="rounded-2xl px-4 py-2 border mt-3" onClick={runCommit}>Commit buchen</button>
        </div>
      )}
      {msg && <pre className="bg-gray-50 rounded-xl p-3 mt-3 text-xs overflow-auto">{msg}</pre>}
    </div>
  );
}

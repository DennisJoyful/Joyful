'use client';

import { useState } from 'react';

export default function SWSAdminPage() {
  const [month, setMonth] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!month) return;
    setLoading(true); setResult(null);
    const res = await fetch('/api/admin/sws-award', { method: 'POST', body: JSON.stringify({ month }), headers: { 'content-type': 'application/json' } });
    const j = await res.json();
    setResult(j);
    setLoading(false);
  }

  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="h1">SWS Punkte vergeben</h1>
      <p className="text-sm text-gray-600 mt-2">Monat als <code>YYYY-MM-01</code> angeben.</p>
      <div className="mt-4 grid gap-2">
        <input className="border rounded-xl px-3 py-2" placeholder="2025-11-01" value={month} onChange={e => setMonth(e.target.value)} />
        <button className="btn" onClick={run} disabled={loading}>{loading ? 'Läuft...' : 'Jetzt berechnen & gutschreiben'}</button>
      </div>
      {result && (
        <pre className="mt-4 text-xs bg-gray-50 p-3 rounded-xl overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}

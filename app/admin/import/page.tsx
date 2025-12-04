'use client';

import { useState } from 'react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true); setMsg('');
    try {
      const formData = new FormData();
      formData.set('file', file);
      const res = await fetch('/api/import/tiktok-monthly', { method: 'POST', body: formData });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Import fehlgeschlagen');
      setMsg(`Import OK: ${j.count} Zeilen`);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="h1">TikTok Monats-Import</h1>
      <p className="text-sm text-gray-600 mt-2">Excel (.xlsx) mit Spalten: creator_id, month (YYYY-MM oder YYYY-MM-01), days_streamed, hours_streamed, minutes_streamed, diamonds, rookie</p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <input type="file" accept=".xlsx" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <button className="btn" disabled={loading}>{loading ? 'Importiere...' : 'Import starten'}</button>
      </form>
      {msg && <div className="mt-3 text-sm">{msg}</div>}
    </div>
  );
}

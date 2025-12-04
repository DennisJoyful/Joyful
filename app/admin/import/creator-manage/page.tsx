'use client';
import { useState } from 'react';

export default function ImportCreatorManagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string>('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.set('file', file);
    setMsg('');
    const res = await fetch('/api/import/creator-manage', { method: 'POST', body: fd });
    const j = await res.json();
    setMsg(JSON.stringify(j, null, 2));
  }

  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="h1">Import – Creator_innen verwalten (aktuell)</h1>
      <p className="text-sm text-gray-600 mt-2">Aktualisiert Handle / legt Streamer an. (Last Stream & Agent-Mapping optional – siehe README.)</p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <input type="file" accept=".xlsx" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <button className="btn">Import starten</button>
      </form>
      {msg && <pre className="mt-4 text-xs bg-gray-50 p-3 rounded-xl overflow-auto">{msg}</pre>}
    </div>
  );
}

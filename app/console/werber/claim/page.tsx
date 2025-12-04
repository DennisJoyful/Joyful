'use client';
import { useState } from 'react';

export default function WerberClaimPage() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/werber/claim', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ code }) });
    const j = await res.json();
    setMsg(JSON.stringify(j, null, 2));
  }

  return (
    <div className="card max-w-md">
      <h1 className="h1">Werber-Konto verknüpfen</h1>
      <p className="text-sm text-gray-600">Gib deinen Referral-Code ein, um dein Profil zu verknüpfen.</p>
      <form onSubmit={submit} className="grid gap-2 mt-3">
        <input className="border rounded-xl px-3 py-2" placeholder="Referral-Code" value={code} onChange={e=>setCode(e.target.value)} />
        <button className="rounded-2xl px-4 py-2 border">Verknüpfen</button>
      </form>
      {msg && <pre className="bg-gray-50 rounded-xl p-3 mt-3 text-xs">{msg}</pre>}
    </div>
  );
}

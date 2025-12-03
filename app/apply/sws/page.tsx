'use client';
import React, { useState } from 'react';

export default function ApplySWS() {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const werber = typeof window !== 'undefined' ? (new URLSearchParams(location.search).get('ref') || 'werber-unknown') : 'werber-unknown';

  async function submit() {
    await fetch('/api/mock/apply', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'sws', werber, name, handle }),
    });
    alert('Danke! Wir haben deine Bewerbung erhalten.');
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Bewerbung (SWS-Link)</h1>
      <input className="border rounded-lg px-3 py-2 w-full" placeholder="Dein Name" value={name} onChange={e=>setName(e.target.value)} />
      <input className="border rounded-lg px-3 py-2 w-full" placeholder="TikTok @handle" value={handle} onChange={e=>setHandle(e.target.value)} />
      <button onClick={submit} className="px-4 py-2 rounded bg-black text-white">Senden</button>
      <p className="text-sm text-gray-600">Dieser Link erfasst die <strong>Leadquelle Werber: {werber}</strong>.</p>
    </main>
  );
}

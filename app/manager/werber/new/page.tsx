'use client';
import React, { useState } from 'react';

function makeRef(len=6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s='';
  for (let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

export default function NewWerber() {
  const [name, setName] = useState('');
  const [refCode, setRefCode] = useState(makeRef());

  async function submit() {
    const res = await fetch('/api/v1/werber', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, ref_code: refCode })
    });
    if (res.ok) {
      alert('Werber angelegt.');
      location.href = '/manager/werber';
    } else {
      const t = await res.text().catch(()=>'');
      alert('Fehler: ' + t);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Neuen Werber anlegen</h1>
      <input className="border rounded-lg px-3 py-2 w-full" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <div className="flex gap-2">
        <input className="border rounded-lg px-3 py-2 w-full" placeholder="Ref-Code" value={refCode} onChange={e=>setRefCode(e.target.value)} />
        <button onClick={()=>setRefCode(makeRef())} className="px-3 py-2 rounded border">neu</button>
      </div>
      <button onClick={submit} className="px-4 py-2 rounded bg-black text-white">Anlegen</button>
      <p className="text-sm text-gray-600">Nach dem Anlegen: Bewerbungslink ist <code>/apply/sws?ref={refCode}</code></p>
    </main>
  );
}

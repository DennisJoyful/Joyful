'use client';
import { useState } from 'react';

export default function DiscordAdminPage() {
  const [msg, setMsg] = useState('');

  async function assignRoles() {
    setMsg('');
    const res = await fetch('/api/discord/assign-roles', { method: 'POST' });
    const j = await res.json();
    setMsg(JSON.stringify(j, null, 2));
  }
  async function kickTerminated() {
    setMsg('');
    const res = await fetch('/api/discord/kick-terminated', { method: 'POST' });
    const j = await res.json();
    setMsg(JSON.stringify(j, null, 2));
  }

  return (
    <div className="card max-w-xl">
      <h1 className="h1">Discord – Aktionen</h1>
      <p className="text-sm text-gray-600">Schreibt Aufgaben in <code>discord_actions</code>, die dein Bot abholen kann.</p>
      <div className="grid gap-2 mt-4">
        <button className="rounded-2xl px-4 py-2 border" onClick={assignRoles}>Rollen zuweisen (nach Diamanten)</button>
        <button className="rounded-2xl px-4 py-2 border" onClick={kickTerminated}>„Beenden“ kicken</button>
      </div>
      {msg && <pre className="bg-gray-50 rounded-xl p-3 mt-4 text-xs overflow-auto">{msg}</pre>}
    </div>
  );
}

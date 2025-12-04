'use client';
import { useState } from 'react';

export default function ApplyForm({ slug }: { slug: string }) {
  const [handle, setHandle] = useState('');
  const [contact, setContact] = useState('');
  const [ok, setOk] = useState<string>('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: post to /api/apply to create lead; here we just show success for now
    setOk('Danke! Deine Bewerbung ist eingegangen. Wir melden uns zeitnah.');
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6 border">
      <div className="text-center">
        <div className="text-xs tracking-widest uppercase text-gray-500">Joyful Live</div>
        <h1 className="text-2xl font-bold mt-1">Bewerbung</h1>
        <div className="text-sm text-gray-500">Referral-Code: <b>{slug}</b></div>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm">TikTok Handle</span>
          <input required value={handle} onChange={e=>setHandle(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="@deinhandle" />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Kontakt (optional)</span>
          <input value={contact} onChange={e=>setContact(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Discord / Telegram / E-Mail" />
        </label>
        <button className="rounded-2xl px-4 py-2 font-semibold border shadow-sm hover:shadow w-full">Jetzt bewerben</button>
        <div className="text-xs text-gray-500 text-center">100% kostenlos • unverbindlich • in 2 Minuten</div>
      </form>

      {ok && <div className="mt-4 text-green-600 text-sm text-center">{ok}</div>}
    </div>
  );
}

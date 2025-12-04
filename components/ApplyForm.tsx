
'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ApplyForm({ slug, mode }: { slug: string, mode: 'manager' | 'sws' }) {
  const [handle, setHandle] = useState('');
  const [contact, setContact] = useState('');
  const [followers, setFollowers] = useState('');
  const [hours, setHours] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function checkHandle() {
    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const res = await fetch(`/api/tiktok/preview?handle=${handle.replace('@','').trim()}`);
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      setPreview(j.data);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function submit() {
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          handle,
          contact,
          followers,
          plannedHours: hours,
          code: slug,
          mode
        })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      alert("Bewerbung erfolgreich übermittelt.");
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="apply-bg min-h-screen px-4 py-10 flex flex-col items-center text-white">
      <div className="flex flex-col items-center mb-6 opacity-90">
        <Image src="/joyful-logo.png" width={88} height={88} alt="logo" />
      </div>

      <div className="apply-card w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          {mode === 'sws' ? "SWS Bewerbung" : "Bewerbung"}
        </h1>

        <label className="text-sm mb-1 block">TikTok Handle</label>
        <input
          className="apply-input"
          placeholder="deinhandle"
          value={handle}
          onChange={(e)=>setHandle(e.target.value)}
        />

        <button className="apply-btn w-full mt-3" onClick={checkHandle}>
          {loading ? "Prüfe..." : "Handle prüfen"}
        </button>

        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

        {preview && (
          <div className="apply-preview mt-4">
            <img src={preview.avatar} className="w-14 h-14 rounded-full" />
            <div>
              <div className="font-semibold">{preview.name}</div>
              <div className="text-sm opacity-80">@{preview.handle}</div>
              <div className="text-sm opacity-80">{preview.followers} Follower</div>
            </div>
          </div>
        )}

        <label className="text-sm mt-4 block">Kontakt</label>
        <input className="apply-input" placeholder="Whatsapp / Discord" value={contact} onChange={(e)=>setContact(e.target.value)} />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm block">Follower (optional)</label>
            <input className="apply-input" value={followers} onChange={(e)=>setFollowers(e.target.value)} />
          </div>
          <div>
            <label className="text-sm block">Streaming Std. (optional)</label>
            <input className="apply-input" value={hours} onChange={(e)=>setHours(e.target.value)} />
          </div>
        </div>

        <button
          className="apply-btn w-full mt-6 disabled:bg-gray-600 disabled:cursor-not-allowed"
          disabled={!preview}
          onClick={submit}
        >
          Bewerbung absenden
        </button>
      </div>
    </div>
  );
}

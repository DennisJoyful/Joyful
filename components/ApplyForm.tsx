'use client';
import { useEffect, useMemo, useState } from 'react';

type ContactMethod = 'whatsapp' | 'discord';

export default function ApplyForm({ slug }: { slug: string }) {
  const [handle, setHandle] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [followers, setFollowers] = useState<string>('');
  const [plannedHours, setPlannedHours] = useState<string>('');
  const [ok, setOk] = useState<string>('');
  const [err, setErr] = useState<string>('');
  const [checking, setChecking] = useState(false);
  const [handleOK, setHandleOK] = useState<null | boolean>(null);

  const normalizedHandle = useMemo(() => handle.replace(/^@/, '').trim(), [handle]);

  async function validateHandle() {
    if (!normalizedHandle) return;
    setChecking(true); setHandleOK(null);
    try {
      const res = await fetch('/api/validate/handle?handle=' + encodeURIComponent(normalizedHandle));
      const j = await res.json();
      setHandleOK(!!j.exists);
    } catch {
      setHandleOK(null);
    } finally {
      setChecking(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOk(''); setErr('');
    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify({
        handle: normalizedHandle,
        code: slug,
        contact: contactMethod + ':' + contactValue,
        followers: followers ? Number(followers) : null,
        plannedHours: plannedHours ? Number(plannedHours) : null
      })
    });
    const j = await res.json();
    if (!res.ok) { setErr(j.error || 'Fehler'); return; }
    setOk('Danke! Deine Bewerbung ist eingegangen. Wir melden uns zeitnah.');
    setHandle(''); setContactValue(''); setFollowers(''); setPlannedHours(''); setHandleOK(null);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-3xl border bg-white shadow p-6 md:p-10">
        <div className="text-center">
          <div className="text-xs tracking-widest uppercase text-gray-500">Joyful Live</div>
          <h1 className="text-3xl font-bold mt-1">Jetzt bewerben</h1>
          <div className="text-sm text-gray-500">Referral-Code: <b>{slug}</b></div>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-5">
          <div className="grid gap-2">
            <label className="text-sm font-medium">TikTok Handle</label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 border rounded-2xl px-3 py-2">
                <span className="text-gray-400">@</span>
                <input required value={handle} onChange={e=>setHandle(e.target.value)} placeholder="deinhandle" className="flex-1 outline-none" />
              </div>
              <button type="button" onClick={validateHandle} className="rounded-2xl px-4 py-2 border whitespace-nowrap">
                {checking ? 'Prüfe…' : 'Handle prüfen'}
              </button>
            </div>
            {handleOK === true && <div className="text-xs text-green-600">Handle scheint zu existieren ✅</div>}
            {handleOK === false && <div className="text-xs text-orange-600">Konnte nicht bestätigt werden – Link manuell prüfen: <a className="underline" href={`https://www.tiktok.com/@${normalizedHandle}`} target="_blank">Profil öffnen</a></div>}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Kontakt</label>
            <div className="grid md:grid-cols-[10rem_1fr] gap-2">
              <select className="border rounded-2xl px-3 py-2" value={contactMethod} onChange={e=>setContactMethod(e.target.value as ContactMethod)}>
                <option value="whatsapp">WhatsApp</option>
                <option value="discord">Discord</option>
              </select>
              <input required className="border rounded-2xl px-3 py-2" placeholder={contactMethod==='whatsapp' ? '+49…' : 'username#1234'} value={contactValue} onChange={e=>setContactValue(e.target.value)} />
            </div>
            <div className="text-xs text-gray-500">Wir kontaktieren dich nur für deine Bewerbung. Kein Spam.</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm">Follower (optional)</span>
              <input inputMode="numeric" pattern="\d*" value={followers} onChange={e=>setFollowers(e.target.value)} className="border rounded-2xl px-3 py-2" placeholder="z. B. 1200" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Geplante Streaming-Stunden pro Monat (optional)</span>
              <input inputMode="numeric" pattern="\d*" value={plannedHours} onChange={e=>setPlannedHours(e.target.value)} className="border rounded-2xl px-3 py-2" placeholder="z. B. 25" />
            </label>
          </div>

          <button className="rounded-2xl px-6 py-3 font-semibold border shadow hover:shadow-md">Bewerbung absenden</button>
          <div className="text-xs text-gray-500 text-center">100% kostenlos • unverbindlich • dauert 2 Minuten</div>
        </form>

        {ok && <div className="mt-4 text-green-600 text-sm text-center">{ok}</div>}
        {err && <div className="mt-2 text-red-600 text-sm text-center">{err}</div>}
      </div>
    </div>
  );
}

'use client';
import { useMemo, useState } from 'react';
import Image from 'next/image';

type ContactMethod = 'whatsapp' | 'discord';

function Label({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm font-medium">{title}</span>
      {hint ? <span className="text-xs text-gray-400">{hint}</span> : null}
    </div>
  );
}

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
  const [consent, setConsent] = useState(false);

  const normalizedHandle = useMemo(() => handle.replace(/^@/, '').trim(), [handle]);

  async function validateHandle() {
    if (!normalizedHandle) { setHandleOK(null); return; }
    setChecking(true); setHandleOK(null);
    try {
      const res = await fetch('/api/validate/handle?handle=' + encodeURIComponent(normalizedHandle));
      const j = await res.json();
      setHandleOK(!!j.exists);
    } catch {
      setHandleOK(false);
    } finally {
      setChecking(false);
    }
  }

  function contactValidationMsg(): string | null {
    if (contactMethod === 'whatsapp') {
      const ok = /^[+]?\d[\d\s()-]{6,}$/.test(contactValue.trim());
      return ok ? null : 'Bitte valide WhatsApp-Nummer angeben (mit Ländervorwahl, z. B. +49...)';
    }
    if (contactMethod === 'discord') {
      const v = contactValue.trim();
      const ok = /^.{2,32}$/.test(v);
      return ok ? null : 'Bitte gültigen Discord-User angeben.';
    }
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOk(''); setErr('');

    if (handleOK !== true) { setErr('Bitte TikTok-Handle zuerst erfolgreich prüfen.'); return; }
    const contactErr = contactValidationMsg();
    if (contactErr) { setErr(contactErr); return; }
    if (!consent) { setErr('Bitte der Datennutzung zustimmen.'); return; }

    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify({
        handle: normalizedHandle,
        code: slug,
        contact: contactMethod + ':' + contactValue.trim(),
        followers: followers ? Number(followers) : null,
        plannedHours: plannedHours ? Number(plannedHours) : null
      })
    });
    const j = await res.json();
    if (!res.ok) { setErr(j.error || 'Fehler'); return; }
    setOk('Danke! Deine Bewerbung ist eingegangen. Wir melden uns zeitnah.');
    setHandle(''); setContactValue(''); setFollowers(''); setPlannedHours(''); setHandleOK(null); setConsent(false);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-3 justify-center">
        <Image src="/joyful-logo.png" alt="Joyful Agency" width={64} height={64} priority className="drop-shadow" />
        <div>
          <div className="text-xs tracking-widest uppercase text-gray-400">Joyful Agency</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Bewirb dich jetzt</h1>
          <div className="text-sm text-gray-500">Referral-Code: <b>{slug}</b></div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-gray-200/70 bg-white/90 backdrop-blur shadow-xl p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl border p-3 text-center">✅ Kostenlose Beratung</div>
          <div className="rounded-2xl border p-3 text-center">⚡ Antwort i. d. R. &lt; 24h</div>
          <div className="rounded-2xl border p-3 text-center">🛡️ Sichere Daten</div>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-5">
          <div className="grid gap-2">
            <Label title="TikTok Handle" hint="Wird gegen die TikTok Web-API geprüft." />
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 border rounded-2xl px-3 py-2">
                <span className="text-gray-400">@</span>
                <input required value={handle} onChange={e=>{ setHandle(e.target.value); setHandleOK(null); }} onBlur={validateHandle} placeholder="deinhandle" className="flex-1 outline-none" />
              </div>
              <button type="button" onClick={validateHandle} className="rounded-2xl px-4 py-2 border whitespace-nowrap">
                {checking ? 'Prüfe…' : handleOK===true ? 'Geprüft ✅' : 'Handle prüfen'}
              </button>
            </div>
            {handleOK === true && <div className="text-xs text-green-600">Handle bestätigt ✅</div>}
            {handleOK === false && (
              <div className="text-xs text-orange-600">
                Konnte nicht bestätigt werden. Öffne <a className="underline" href={`https://www.tiktok.com/@${normalizedHandle}`} target="_blank">dein Profil</a> zur Kontrolle.
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label title="Kontakt" hint="Nur für Rückfragen zur Bewerbung." />
            <div className="grid md:grid-cols-[12rem_1fr] gap-2">
              <select className="border rounded-2xl px-3 py-2" value={contactMethod} onChange={e=>setContactMethod(e.target.value as ContactMethod)}>
                <option value="whatsapp">WhatsApp</option>
                <option value="discord">Discord</option>
              </select>
              <input required className="border rounded-2xl px-3 py-2" placeholder={contactMethod==='whatsapp' ? '+49…' : 'discordname'} value={contactValue} onChange={e=>setContactValue(e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <Label title="Follower (optional)" />
              <input inputMode="numeric" pattern="\\d*" value={followers} onChange={e=>setFollowers(e.target.value)} className="border rounded-2xl px-3 py-2" placeholder="z. B. 1200" />
            </label>
            <label className="grid gap-1">
              <Label title="Geplante Streaming-Stunden pro Monat (optional)" />
              <input inputMode="numeric" pattern="\\d*" value={plannedHours} onChange={e=>setPlannedHours(e.target.value)} className="border rounded-2xl px-3 py-2" placeholder="z. B. 25" />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} />
            Ich stimme der Verarbeitung meiner Angaben zum Zweck der Bewerbung zu.
          </label>

          <button disabled={handleOK!==true} className={"rounded-2xl px-6 py-3 font-semibold border shadow hover:shadow-md bg-gradient-to-r from-yellow-300 to-amber-400 " + (handleOK===true ? '' : 'opacity-60 cursor-not-allowed')}>
            Bewerbung absenden
          </button>
          <div className="text-xs text-gray-500 text-center">100% kostenlos • unverbindlich • dauert 2 Minuten</div>
        </form>

        {ok && <div className="mt-4 text-green-600 text-sm text-center">{ok}</div>}
        {err && <div className="mt-2 text-red-600 text-sm text-center">{err}</div>}
      </div>

      <div className="mt-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Joyful Agency • #teamjoyful
      </div>
    </div>
  );
}

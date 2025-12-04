'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

type ContactMethod = 'whatsapp' | 'discord';

function Label({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm font-medium">{title}</span>
      {hint ? <span className="text-xs text-gray-400 dark:text-gray-500">{hint}</span> : null}
    </div>
  );
}

function isTikTokProfileUrl(u: string) {
  try {
    const url = new URL(u);
    if (!/^www\.tiktok\.com$/.test(url.hostname)) return false;
    return url.pathname.includes('/@');
  } catch {
    return false;
  }
}

function extractHandleFromUrl(u: string): string | null {
  try {
    const url = new URL(u);
    const after = url.pathname.split('/@')[1] || '';
    const handle = after.split(/[/?#]/)[0];
    return handle || null;
  } catch {
    return null;
  }
}

export default function ApplyForm({ slug }: { slug: string }) {
  const [handle, setHandle] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [followers, setFollowers] = useState('');
  const [plannedHours, setPlannedHours] = useState('');
  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');
  const [consent, setConsent] = useState(false);

  const normalizedHandle = useMemo(() => handle.replace(/^@/, '').trim().toLowerCase(), [handle]);
  const urlValid = useMemo(() => profileUrl && isTikTokProfileUrl(profileUrl.trim()), [profileUrl]);
  const urlHandle = useMemo(() => profileUrl ? (extractHandleFromUrl(profileUrl.trim()) || '') : '', [profileUrl]);
  const matches = useMemo(() => normalizedHandle && urlHandle && normalizedHandle === urlHandle.toLowerCase(), [normalizedHandle, urlHandle]);

  useEffect(() => {
    // Auto-Handle aus URL übernehmen, wenn leer
    if (!normalizedHandle && urlHandle) setHandle(urlHandle);
  }, [urlHandle, normalizedHandle]);

  useEffect(() => {
    // Abbruch-Tracking (optional)
    const send = () => {
      try {
        const payload = {
          t: Date.now(),
          type: 'abandon',
          slug,
          handle: normalizedHandle || null,
          urlProvided: !!profileUrl,
          ua: navigator.userAgent || ''
        };
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon && navigator.sendBeacon('/api/track/abandon', blob);
      } catch {}
    };
    window.addEventListener('beforeunload', send);
    return () => window.removeEventListener('beforeunload', send);
  }, [slug, normalizedHandle, profileUrl]);

  function validateContact(): string | null {
    if (contactMethod === 'whatsapp') {
      const ok = /^[+]?[\d][\d\s()-]{6,}$/.test(contactValue.trim());
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

    if (!normalizedHandle) return setErr('Bitte TikTok Handle eingeben.');
    if (!urlValid) return setErr('Bitte gültige TikTok Profil-URL einfügen.');
    if (!matches) return setErr('Profil-URL passt nicht zum Handle.');
    const contactErr = validateContact();
    if (contactErr) return setErr(contactErr);
    if (!consent) return setErr('Bitte der Datennutzung zustimmen.');

    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'content-type':'application/json' },
      body: JSON.stringify({
        handle: normalizedHandle,
        profile_url: profileUrl.trim(),
        code: slug,
        contact: `${contactMethod}:${contactValue.trim()}`,
        followers: followers ? Number(followers) : null,
        plannedHours: plannedHours ? Number(plannedHours) : null
      })
    });
    const j = await res.json();
    if (!res.ok) return setErr(j.error || 'Fehler');

    // Success tracking (optional)
    try {
      await fetch('/api/track/apply', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({
        t: Date.now(),
        type: 'success',
        slug,
        handle: normalizedHandle,
        ua: navigator.userAgent || ''
      })});
    } catch {}

    setOk('Danke! Deine Bewerbung ist eingegangen. Wir melden uns zeitnah.');
    setHandle(''); setProfileUrl(''); setContactValue(''); setFollowers(''); setPlannedHours(''); setConsent(false);
  }

  return (
    <div className="relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="absolute -top-24 -right-24 w-[36rem] h-[36rem] rounded-full bg-amber-200/40 blur-3xl -z-10 dark:bg-yellow-500/10" />
      <div className="absolute -bottom-24 -left-24 w-[36rem] h-[36rem] rounded-full bg-yellow-100/50 blur-3xl -z-10 dark:bg-yellow-600/10" />

      {/* Header */}
      <div className="flex items-center gap-3 justify-center">
        <Image src="/joyful-logo.png" alt="Joyful Agency" width={64} height={64} priority className="drop-shadow" />
        <div>
          <div className="text-xs tracking-widest uppercase text-gray-400 dark:text-gray-500 animate-pulse">Joyful Agency</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Bewirb dich jetzt</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">Referral-Code: <b>{slug}</b></div>
        </div>
      </div>

      {/* Card */}
      <div className="mt-8 rounded-3xl border border-gray-200/70 bg-white/90 dark:bg-zinc-900/80 backdrop-blur shadow-xl p-6 md:p-10">
        {/* USPs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl border p-3 text-center dark:border-zinc-700">✅ Kostenlose Beratung</div>
          <div className="rounded-2xl border p-3 text-center dark:border-zinc-700">⚡ Antwort i. d. R. &lt; 24h</div>
          <div className="rounded-2xl border p-3 text-center dark:border-zinc-700">🛡️ Sichere Daten</div>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-5">
          {/* Handle */}
          <div className="grid gap-2">
            <Label title="TikTok Handle" hint="Ohne @ eingeben" />
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 border rounded-2xl px-3 py-2 dark:border-zinc-700">
                <span className="text-gray-400">@</span>
                <input required value={handle} onChange={(e)=>setHandle(e.target.value)} placeholder="deinhandle" className="flex-1 outline-none bg-transparent" />
              </div>
              <a target="_blank" href={normalizedHandle ? `https://www.tiktok.com/@${normalizedHandle}` : '#'} className={"rounded-2xl px-4 py-2 border dark:border-zinc-700 whitespace-nowrap " + (normalizedHandle ? "" : "pointer-events-none opacity-50")}>Profil öffnen</a>
            </div>
          </div>

          {/* Profile URL */}
          <div className="grid gap-2">
            <Label title="TikTok Profil-Link" hint="Link aus Browser kopieren & hier einfügen" />
            <input required value={profileUrl} onChange={(e)=>setProfileUrl(e.target.value)} placeholder="https://www.tiktok.com/@deinhandle" className="border rounded-2xl px-3 py-2 dark:border-zinc-700 bg-transparent" />
            {!!profileUrl && !urlValid && <div className="text-xs text-red-500">Bitte gültige TikTok URL (https://www.tiktok.com/@...)</div>}
            {!!profileUrl && urlValid && !matches && <div className="text-xs text-red-500">Profil-URL passt nicht zum Handle.</div>}
            {!!profileUrl && urlValid && matches && <div className="text-xs text-green-600">Perfekt – URL & Handle stimmen überein ✅</div>}
          </div>

          {/* Contact */}
          <div className="grid gap-2">
            <Label title="Kontakt" hint="Nur für Rückfragen zur Bewerbung." />
            <div className="grid md:grid-cols-[12rem_1fr] gap-2">
              <select className="border rounded-2xl px-3 py-2 dark:border-zinc-700 bg-transparent" value={contactMethod} onChange={e=>setContactMethod(e.target.value as ContactMethod)}>
                <option value="whatsapp">WhatsApp</option>
                <option value="discord">Discord</option>
              </select>
              <input required className="border rounded-2xl px-3 py-2 dark:border-zinc-700 bg-transparent" placeholder={contactMethod==='whatsapp' ? '+49…' : 'discordname'} value={contactValue} onChange={e=>setContactValue(e.target.value)} />
            </div>
          </div>

          {/* Optional fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <Label title="Follower (optional)" />
              <input inputMode="numeric" pattern="\d*" value={followers} onChange={e=>setFollowers(e.target.value)} className="border rounded-2xl px-3 py-2 dark:border-zinc-700 bg-transparent" placeholder="z. B. 1200" />
            </label>
            <label className="grid gap-1">
              <Label title="Geplante Streaming-Stunden pro Monat (optional)" />
              <input inputMode="numeric" pattern="\d*" value={plannedHours} onChange={e=>setPlannedHours(e.target.value)} className="border rounded-2xl px-3 py-2 dark:border-zinc-700 bg-transparent" placeholder="z. B. 25" />
            </label>
          </div>

          {/* Consent */}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} />
            Ich stimme der Verarbeitung meiner Angaben zum Zweck der Bewerbung zu.
          </label>

          {/* Submit */}
          <button className={"rounded-2xl px-6 py-3 font-semibold border shadow hover:shadow-md bg-gradient-to-r from-yellow-300 to-amber-400 dark:from-yellow-500 dark:to-amber-500 " + (!matches ? "opacity-60 cursor-not-allowed" : "")} disabled={!matches}>
            Bewerbung absenden
          </button>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">100% kostenlos • unverbindlich • dauert 2 Minuten</div>
        </form>

        {ok && <div className="mt-4 text-green-600 text-sm text-center">{ok}</div>}
        {err && <div className="mt-2 text-red-500 text-sm text-center">{err}</div>}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        © {new Date().getFullYear()} Joyful Agency • #teamjoyful
      </div>
    </div>
  );
}

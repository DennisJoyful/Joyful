'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type ContactMethod = 'whatsapp' | 'discord';

declare global {
  interface Window {
    tiktokEmbedLoaded?: boolean;
  }
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

export default function ApplyForm({ slug }: { slug: string }) {
  // Form state
  const [handle, setHandle] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [followers, setFollowers] = useState('');
  const [plannedHours, setPlannedHours] = useState('');
  const [consent, setConsent] = useState(false);

  // UX state
  const [checking, setChecking] = useState(false);
  const [verifiedBy, setVerifiedBy] = useState<null | 'embed' | 'manual'>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  // Embed container ref
  const embedRef = useRef<HTMLDivElement>(null);

  // Load TikTok embed script once (client)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = 'tiktok-embed-js';
    if (document.getElementById(id)) return;
    const s = document.createElement('script');
    s.id = id;
    s.async = true;
    s.src = 'https://www.tiktok.com/embed.js';
    s.onload = () => { window.tiktokEmbedLoaded = true; };
    document.body.appendChild(s);
  }, []);

  // Attempt embed verification
  async function verifyByEmbed() {
    setError('');
    setOk('');
    setVerifiedBy(null);
    setChecking(true);

    const h = handle.replace(/^@/, '').trim();
    if (!h) { setError('Bitte Handle eingeben.'); setChecking(false); return; }

    // Clear previous content
    const box = embedRef.current;
    if (box) box.innerHTML = '';

    // Create blockquote
    const bq = document.createElement('blockquote');
    bq.className = 'tiktok-embed';
    bq.setAttribute('cite', `https://www.tiktok.com/@${h}`);
    bq.setAttribute('data-unique-id', h);
    bq.setAttribute('data-embed-type', 'creator');
    bq.style.maxWidth = '480px';
    bq.style.minWidth = '240px';
    const sec = document.createElement('section');
    const a = document.createElement('a');
    a.href = `https://www.tiktok.com/@${h}?refer=creator_embed`;
    a.target = '_blank';
    a.textContent = '@' + h;
    sec.appendChild(a);
    bq.appendChild(sec);
    if (box) box.appendChild(bq);

    // Trigger embed.js parse
    // @ts-ignore
    if (window.tiktok) {
      // @ts-ignore
      window.tiktok?.init?.();
    }

    // Wait a moment for embed.js to process
    const start = Date.now();
    let ok = false;
    while (Date.now() - start < 2000) {
      await new Promise(r => setTimeout(r, 150));
      if (!embedRef.current) break;
      // success if an iframe appears under our container
      const iframe = embedRef.current.querySelector('iframe');
      if (iframe) { ok = true; break; }
    }

    setChecking(false);
    if (ok) {
      setVerifiedBy('embed');
    } else {
      setError('Konnte per Embed nicht bestätigen. Du kannst „Profil öffnen“ und manuell bestätigen.');
    }
  }

  function validateContact(): string | null {
    const v = contactValue.trim();
    if (contactMethod === 'whatsapp') {
      if (!/^[+]?[\d][\d\s()-]{6,}$/.test(v)) return 'Bitte gültige WhatsApp-Nummer angeben.';
    }
    if (contactMethod === 'discord') {
      if (!/^.{2,32}$/.test(v)) return 'Bitte gültigen Discord-Namen angeben.';
    }
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setOk('');

    const h = handle.replace(/^@/, '').trim();
    if (!h) { setError('Bitte Handle eingeben.'); return; }

    if (!verifiedBy) { setError('Bitte Handle zuerst bestätigen (Embed oder manuell).'); return; }

    const contactErr = validateContact();
    if (contactErr) { setError(contactErr); return; }
    if (!consent) { setError('Bitte der Datennutzung zustimmen.'); return; }

    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        handle: h,
        code: slug,
        contact: `${contactMethod}:${contactValue.trim()}`,
        followers: followers ? Number(followers) : null,
        plannedHours: plannedHours ? Number(plannedHours) : null,
        verificationMethod: verifiedBy
      })
    });
    const j = await res.json();
    if (!res.ok) { setError(j.error || 'Fehler'); return; }

    setOk('Danke! Deine Bewerbung ist eingegangen.');
    setHandle(''); setContactValue(''); setFollowers(''); setPlannedHours('');
    setConsent(false); setVerifiedBy(null);
    if (embedRef.current) embedRef.current.innerHTML = '';
  }

  return (
    <div className="min-h-[85vh] bg-white text-slate-900">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <Image src="/joyful-logo.png" alt="Joyful Agency" width={56} height={56} priority />
          <div>
            <div className="text-xs tracking-wide uppercase text-slate-500">Joyful Agency</div>
            <h1 className="text-3xl font-bold tracking-tight">Bewerbung</h1>
            <div className="text-sm text-slate-500">Referral-Code: <b>{slug}</b></div>
          </div>
        </div>

        {/* Card */}
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 md:p-8">
            {/* Handle + Actions */}
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label>TikTok Handle</Label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
                    <span className="text-slate-400">@</span>
                    <input
                      value={handle}
                      onChange={(e)=>{ setHandle(e.target.value); setVerifiedBy(null); setError(''); }}
                      placeholder="deinhandle"
                      className="flex-1 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={verifyByEmbed}
                    className="rounded-xl px-4 py-2 border border-slate-300 hover:bg-slate-50 text-sm font-medium"
                  >
                    {checking ? 'Prüfe…' : 'Per Embed prüfen'}
                  </button>
                  <a
                    target="_blank"
                    href={handle.trim() ? `https://www.tiktok.com/@${handle.replace(/^@/,'').trim()}` : '#'}
                    className={"rounded-xl px-4 py-2 border border-slate-300 hover:bg-slate-50 text-sm font-medium " + (!handle.trim() ? 'pointer-events-none opacity-50' : '')}
                    onClick={()=> setVerifiedBy('manual')}
                  >
                    Profil öffnen
                  </a>
                </div>
                <div className="text-xs text-slate-500">Wenn der Embed nicht lädt (z. B. In‑App‑Browser), Profil öffnen und manuell bestätigen.</div>
              </div>

              {/* Embed preview (compact) */}
              <div ref={embedRef} className="mt-2 flex justify-center"></div>

              {/* Verified badge */}
              {verifiedBy && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <span>✔</span>
                  <span>Handle bestätigt ({verifiedBy === 'embed' ? 'Embed' : 'Manuell'})</span>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="mt-6 grid gap-3">
              <Label>Kontakt</Label>
              <div className="grid md:grid-cols-[12rem_1fr] gap-2">
                <select className="border border-slate-200 rounded-xl px-3 py-2" value={contactMethod} onChange={e=>setContactMethod(e.target.value as ContactMethod)}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="discord">Discord</option>
                </select>
                <input className="border border-slate-200 rounded-xl px-3 py-2" placeholder={contactMethod==='whatsapp' ? '+49…' : 'discordname'} value={contactValue} onChange={e=>setContactValue(e.target.value)} />
              </div>
            </div>

            {/* Optional */}
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label>Follower (optional)</Label>
                <input className="border border-slate-200 rounded-xl px-3 py-2" inputMode="numeric" value={followers} onChange={e=>setFollowers(e.target.value)} placeholder="z. B. 1200" />
              </div>
              <div className="grid gap-1">
                <Label>Geplante Streaming-Stunden (optional)</Label>
                <input className="border border-slate-200 rounded-xl px-3 py-2" inputMode="numeric" value={plannedHours} onChange={e=>setPlannedHours(e.target.value)} placeholder="z. B. 25" />
              </div>
            </div>

            {/* Consent */}
            <label className="mt-6 flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} />
              Ich stimme der Verarbeitung meiner Angaben zum Zweck der Bewerbung zu.
            </label>

            {/* Submit */}
            <button
              onClick={(e)=>{}}
              disabled={!verifiedBy}
              className={"mt-6 w-full rounded-xl px-5 py-3 text-white font-semibold shadow-sm " + (verifiedBy ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-400 cursor-not-allowed")}
              onMouseDown={()=>{}}
              onKeyDown={()=>{}}
              onTouchStart={()=>{}}
              onClickCapture={submit}
            >
              Bewerbung absenden
            </button>

            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
            {ok && <div className="mt-3 text-sm text-emerald-600">{ok}</div>}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500">© {new Date().getFullYear()} Joyful Agency</div>
      </div>
    </div>
  );
}

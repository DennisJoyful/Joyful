
'use client';

import { useState } from 'react';
import Image from 'next/image';

type ContactMethod = 'whatsapp' | 'discord';

interface TikTokUser {
  avatar: string;
  nickname: string;
  followers: number;
}

export default function ApplyForm({ slug }: { slug: string }) {
  const [handle, setHandle] = useState('');
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [tiktokUser, setTiktokUser] = useState<TikTokUser | null>(null);

  const [contactMethod, setContactMethod] = useState<ContactMethod>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [followers, setFollowers] = useState('');
  const [plannedHours, setPlannedHours] = useState('');

  const [ok, setOk] = useState('');
  const [err, setErr] = useState('');

  async function checkHandle() {
    setErr('');
    setOk('');
    setVerified(false);
    setTiktokUser(null);

    const h = handle.replace('@','').trim();
    if (!h) {
      setErr('Bitte Handle eingeben.');
      return;
    }

    setChecking(true);
    try {
      const url = `https://www.tiktok.com/api/user/detail/?uniqueId=${h}`;
      const res = await fetch(url, { method: "GET" });

      if (!res.ok) {
        setErr('Handle konnte nicht bestätigt werden.');
        setChecking(false);
        return;
      }

      const data = await res.json();
      if (!data || !data.userInfo || !data.userInfo.user) {
        setErr('Handle nicht gefunden.');
        setChecking(false);
        return;
      }

      const user = data.userInfo.user;
      setTiktokUser({
        avatar: user.avatarThumb || user.avatarMedium || user.avatarLarger || '',
        nickname: user.nickname || h,
        followers: data.userInfo.stats?.followerCount || 0
      });

      setVerified(true);
    } catch (e) {
      setErr('Fehler bei der Prüfung.');
    }
    setChecking(false);
  }

  function validateContact(): string | null {
    const v = contactValue.trim();
    if (contactMethod === 'whatsapp') {
      if (!/^[+]?[\d][\d\s()-]{5,}$/.test(v)) return 'Bitte gültige WhatsApp-Nummer angeben.';
    }
    if (contactMethod === 'discord') {
      if (!/^.{2,32}$/.test(v)) return 'Bitte gültigen Discord-Namen angeben.';
    }
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setOk('');

    if (!verified) {
      setErr('Bitte Handle zuerst bestätigen.');
      return;
    }

    const contactErr = validateContact();
    if (contactErr) {
      setErr(contactErr);
      return;
    }

    const res = await fetch('/api/apply', {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        handle: handle.replace('@','').trim(),
        code: slug,
        contact: `${contactMethod}:${contactValue.trim()}`,
        followers: followers ? Number(followers) : null,
        plannedHours: plannedHours ? Number(plannedHours) : null
      })
    });

    const j = await res.json();
    if (!res.ok) {
      setErr(j.error || 'Fehler beim Absenden.');
      return;
    }

    setOk('Danke! Deine Bewerbung wurde eingereicht.');
    setHandle('');
    setContactValue('');
    setFollowers('');
    setPlannedHours('');
    setVerified(false);
    setTiktokUser(null);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 text-white">
      <div className="flex flex-col items-center gap-4 mb-8">
        <Image src="/joyful-logo.png" width={72} height={72} alt="Joyful" />
        <h1 className="text-3xl font-bold">Bewirb dich jetzt</h1>
        <p className="text-sm text-gray-300">Referral Code: <b>{slug}</b></p>
      </div>

      <form onSubmit={submit} className="space-y-6 bg-black/30 backdrop-blur-xl p-6 rounded-3xl border border-white/10">

        {/* Handle Eingabe */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">TikTok Handle</label>
          <div className="flex gap-2">
            <input
              value={handle}
              onChange={(e)=>setHandle(e.target.value)}
              placeholder="deinhandle"
              className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none"
            />
            <button
              type="button"
              onClick={checkHandle}
              className="px-4 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 transition text-sm font-semibold"
            >
              {checking ? "..." : "Prüfen"}
            </button>
          </div>
        </div>

        {/* Kompakte Profilkarte */}
        {tiktokUser && verified && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
            <img src={tiktokUser.avatar} width="60" height="60" className="rounded-full" />
            <div>
              <div className="font-semibold">@{handle.replace('@','')}</div>
              <div className="text-sm text-gray-300">{tiktokUser.followers.toLocaleString()} Follower</div>
              <div className="text-green-400 text-sm mt-1">✔ Profil bestätigt</div>
            </div>
          </div>
        )}

        {/* Kontakt */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Kontakt</label>
          <div className="grid grid-cols-[10rem_1fr] gap-2">
            <select
              value={contactMethod}
              onChange={(e)=>setContactMethod(e.target.value as ContactMethod)}
              className="px-3 py-3 rounded-xl bg-black/40 border border-white/10"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="discord">Discord</option>
            </select>
            <input
              value={contactValue}
              onChange={(e)=>setContactValue(e.target.value)}
              placeholder={contactMethod === 'whatsapp' ? '+49…' : 'discordname'}
              className="px-4 py-3 rounded-xl bg-black/40 border border-white/10"
            />
          </div>
        </div>

        {/* Optional */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-300">Follower (optional)</label>
            <input
              value={followers}
              onChange={(e)=>setFollowers(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300">Geplante Stunden (optional)</label>
            <input
              value={plannedHours}
              onChange={(e)=>setPlannedHours(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10"
              inputMode="numeric"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!verified}
          className="w-full py-4 rounded-xl bg-pink-600 hover:bg-pink-700 transition font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Bewerbung absenden
        </button>

        {err && <div className="text-red-400 text-sm">{err}</div>}
        {ok && <div className="text-green-400 text-sm">{ok}</div>}
      </form>
    </div>
  );
}

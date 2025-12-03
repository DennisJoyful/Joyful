'use client'

import { useState } from 'react'

type Mode = 'with_email' | 'without_email'

export default function AdminManagersPage() {
  const [mode, setMode] = useState<Mode>('with_email')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [handle, setHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [res, setRes] = useState<any>(null)
  const [err, setErr] = useState<string>('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setRes(null)
    setLoading(true)

    try {
      const payload: any = { display_name: displayName, mode }
      if (mode === 'with_email') payload.email = email
      if (mode === 'without_email') payload.tiktok_handle = handle

      // WICHTIG: Proxy benutzen – KEIN Authorization-Header im Client!
      const r = await fetch('/api/_admin/proxy?to=/api/admin/managers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await r.json()
      if (!r.ok || !data.ok) {
        setErr(data?.error || `HTTP ${r.status}`)
      } else {
        setRes(data)
      }
    } catch (e: any) {
      setErr(e?.message || 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Manager anlegen (Admin)</h1>
        <p className="text-sm text-gray-600">
          Mit E-Mail = Login möglich. Ohne E-Mail = nur Referral (kein Login).
        </p>
      </div>

      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === 'with_email'}
            onChange={() => setMode('with_email')}
          />
          Mit E-Mail (empfohlen)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === 'without_email'}
            onChange={() => setMode('without_email')}
          />
          Ohne E-Mail (kein Login)
        </label>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm">Anzeigename</span>
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Max Mustermann"
          />
        </label>

        {mode === 'with_email' && (
          <label className="block">
            <span className="text-sm">E-Mail (für Login/Einladung)</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="manager@beispiel.de"
            />
          </label>
        )}

        {mode === 'without_email' && (
          <label className="block">
            <span className="text-sm">TikTok-Handle (nur Notiz)</span>
            <input
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="managerhandle"
            />
          </label>
        )}

        <button
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {loading ? 'Anlegen…' : 'Anlegen'}
        </button>
      </form>

      {err && (
        <div className="p-3 border border-red-300 bg-red-50 text-sm text-red-700 rounded">
          Fehler: {err}
        </div>
      )}

      {res?.ok && (
        <div className="p-3 border rounded text-sm space-y-1">
          <p className="font-medium text-green-700">Erfolgreich angelegt.</p>
          {res.manager_id && (
            <p>
              Manager-ID: <code>{res.manager_id}</code>
            </p>
          )}
          <p>
            Bewerbungslink: <code>{res.apply_url}</code>
          </p>
          <p>
            Referral-Code: <code>{res.referral_code}</code>
          </p>
          {res.note && <p className="text-amber-700">{res.note}</p>}
          <p className="text-gray-600">
            Hinweis: Der Bewerbungslink ist für den Manager später auch unter{' '}
            <code>/manager/profile</code> sichtbar (nach Login).
          </p>
        </div>
      )}
    </div>
  )
}

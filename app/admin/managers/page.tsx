
'use client'
import { useState } from 'react'

export default function AdminManagersPage() {
  const [mode, setMode] = useState<'with_email'|'without_email'>('with_email')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [handle, setHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [res, setRes] = useState<any>(null)
  const [err, setErr] = useState<string>('')
  const [diag, setDiag] = useState<any>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setRes(null)
    setLoading(true)
    setDiag(null)

    try {
      const payload: any = { display_name: displayName, mode }
      if (mode === 'with_email') payload.email = email
      if (mode === 'without_email') payload.tiktok_handle = handle

      const r = await fetch('/api/_admin/proxy?to=/api/admin/managers/create', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      })

      const txt = await r.text()
      let data: any
      try { data = JSON.parse(txt) } catch {
        data = { ok:false, error:`Non-JSON response (status ${r.status})`, details: txt.slice(0,300) }
      }

      if (!r.ok || !data.ok) {
        setErr(data?.error || `HTTP ${r.status}`)

        // Diagnose 1: Proxy -> ping (GET)
        const pr = await fetch('/api/_admin/proxy?to=/api/admin/ping&m=GET', { method:'POST' })
        const ptxt = await pr.text()
        let pobj: any
        try { pobj = JSON.parse(ptxt) } catch { pobj = { raw: ptxt } }

        // Diagnose 2: Proxy -> echo (POST)
        const eresp = await fetch('/api/_admin/proxy?to=/api/admin/echo', {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ probe: true })
        })
        const etxt = await eresp.text()
        let eobj: any
        try { eobj = JSON.parse(etxt) } catch { eobj = { raw: etxt } }

        setDiag({ proxyPing: pobj, proxyEcho: eobj, upstream: data })
      } else {
        setRes(data)
      }
    } catch (e:any) {
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
          <input type="radio" checked={mode==='with_email'} onChange={()=>setMode('with_email')} />
          Mit E-Mail (empfohlen)
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={mode==='without_email'} onChange={()=>setMode('without_email')} />
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
        <div className="p-3 border border-red-300 bg-red-50 text-sm text-red-700 rounded space-y-2">
          <div>Fehler: {err}</div>
          {diag && (
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(diag, null, 2)}</pre>
          )}
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
            Hinweis: Der Bewerbungslink ist später nach Login unter <code>/manager/profile</code> sichtbar.
          </p>
        </div>
      )}
    </div>
  )
}

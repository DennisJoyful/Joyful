'use client'
import { useState } from 'react'

export default function AdminManagersPage() {
  const [mode, setMode] = useState<'with_email'|'without_email'>('with_email')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [handle, setHandle] = useState('')
  const [res, setRes] = useState<any>(null)
  const [err, setErr] = useState<string>('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setRes(null)
    const payload: any = { display_name: displayName, mode }
    if (mode === 'with_email') payload.email = email
    if (mode === 'without_email') payload.tiktok_handle = handle

    const r = await fetch('/api/admin/managers/create', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || ''}` // optional: öffentliches Echo, sonst per Route Action setzen
      },
      body: JSON.stringify(payload)
    })
    const data = await r.json()
    if (!data.ok) setErr(data.error || 'Fehler')
    else setRes(data)
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Manager anlegen (Admin)</h1>

      <div className="flex gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="radio" checked={mode==='with_email'} onChange={()=>setMode('with_email')} />
          Mit E-Mail (empfohlen – Login möglich)
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={mode==='without_email'} onChange={()=>setMode('without_email')} />
          Ohne E-Mail (kein Login)
        </label>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-sm">Anzeigename</span>
          <input required value={displayName} onChange={e=>setDisplayName(e.target.value)}
                 className="mt-1 w-full border rounded px-3 py-2" />
        </label>

        {mode === 'with_email' && (
          <label className="block">
            <span className="text-sm">E-Mail</span>
            <input required type="email" value={email} onChange={e=>setEmail(e.target.value)}
                   className="mt-1 w-full border rounded px-3 py-2" />
          </label>
        )}

        {mode === 'without_email' && (
          <label className="block">
            <span className="text-sm">TikTok-Handle (nur für Notiz)</span>
            <input required value={handle} onChange={e=>setHandle(e.target.value)}
                   className="mt-1 w-full border rounded px-3 py-2" placeholder="managerhandle" />
          </label>
        )}

        <button className="px-4 py-2 rounded bg-black text-white">Anlegen</button>
      </form>

      {err && <p className="text-red-600">{err}</p>}
      {res?.ok && (
        <div className="border rounded p-3 text-sm space-y-1">
          <p><b>Erfolgreich angelegt.</b></p>
          {res.manager_id && <p>Manager-ID: <code>{res.manager_id}</code></p>}
          <p>Referral-Code: <code>{res.referral_code}</code></p>
          <p>Bewerbungslink: <code>{res.apply_url}</code></p>
          {res.note && <p className="text-amber-700">{res.note}</p>}
        </div>
      )}
    </div>
  )
}

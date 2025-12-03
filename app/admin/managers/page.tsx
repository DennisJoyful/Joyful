
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

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setRes(null); setLoading(true)
    try {
      const payload: any = { display_name: displayName, mode }
      if (mode === 'with_email') payload.email = email
      if (mode === 'without_email') payload.tiktok_handle = handle
      const r = await fetch('/api/admin/managers/create', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      const txt = await r.text(); let data:any; try{ data = JSON.parse(txt) }catch{ data={ok:false,error:'Non-JSON',details:txt} }
      if (!r.ok || !data.ok) setErr(data.error||`HTTP ${r.status}`); else setRes(data)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-semibold">Manager anlegen (TEMP ohne Auth)</h1>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="radio" checked={mode==='with_email'} onChange={()=>setMode('with_email')} /> Mit E-Mail</label>
        <label className="flex items-center gap-2"><input type="radio" checked={mode==='without_email'} onChange={()=>setMode('without_email')} /> Ohne E-Mail</label>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input required value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Anzeigename" className="w-full border rounded px-3 py-2" />
        {mode==='with_email' && <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="manager@beispiel.de" className="w-full border rounded px-3 py-2" />}
        {mode==='without_email' && <input required value={handle} onChange={e=>setHandle(e.target.value)} placeholder="TikTok-Handle (nur Notiz)" className="w-full border rounded px-3 py-2" />}
        <button disabled={loading} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">{loading?'Anlegen…':'Anlegen'}</button>
      </form>
      {err && <div className="p-2 border border-red-300 bg-red-50 text-sm text-red-700 rounded">Fehler: {err}</div>}
      {res?.ok && <div className="p-3 border rounded text-sm space-y-1">
        <p className="font-medium text-green-700">Erfolgreich angelegt.</p>
        {res.manager_id && <p>Manager-ID: <code>{res.manager_id}</code></p>}
        <p>Bewerbungslink: <code>{res.apply_url}</code></p>
        <p>Referral-Code: <code>{res.referral_code}</code></p>
      </div>}
    </div>
  )
}


'use client'
import { useState } from 'react'

export default function SWSManagePage() {
  const [handle, setHandle] = useState('')
  const [name, setName]   = useState('')
  const [managerId, setManagerId] = useState('') // zunächst manuell
  const [res, setRes] = useState<any>(null)
  const [err, setErr] = useState<string>('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setRes(null)
    const r = await fetch('/api/manager/recruiters/create', {
      method:'POST', headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ handle, display_name: name, manager_id: managerId })
    })
    const data = await r.json().catch(()=>({ok:false,error:'No JSON'}))
    if (!data.ok) setErr(data.error||'Fehler'); else setRes(data)
  }

  return (
    <div className="max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Werber anlegen</h1>
      <form onSubmit={submit} className="space-y-3">
        <input required value={handle} onChange={e=>setHandle(e.target.value)} placeholder="TikTok-Handle (ohne @)" className="w-full border rounded px-3 py-2" />
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Anzeigename" className="w-full border rounded px-3 py-2" />
        <input required value={managerId} onChange={e=>setManagerId(e.target.value)} placeholder="Deine Manager-ID (auth.users.id)" className="w-full border rounded px-3 py-2" />
        <button className="px-4 py-2 rounded bg-black text-white">Anlegen</button>
      </form>
      {err && <p className="text-red-600">{err}</p>}
      {res?.ok && <div className="mt-4 p-3 border rounded">
        <p><b>Werber angelegt.</b></p>
        <p>Referral-Code: <code>{res.referral_code}</code></p>
        <p>Werber-Ansicht: <code>/werber/{'{'}{res.public_code}{'}'}</code></p>
      </div>}
    </div>
  )
}

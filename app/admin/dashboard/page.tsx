
'use client'
import { useEffect, useState } from 'react'

export default function AdminDashboard(){
  const [data, setData] = useState<any>(null)
  const [err, setErr] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ (async()=>{
    setLoading(true)
    const r = await fetch('/api/admin/dashboard/metrics', { method:'POST' })
    const j = await r.json().catch(()=>({ok:false,error:'keine JSON'}))
    if (!j.ok) setErr(j.error||'Fehler'); else setData(j)
    setLoading(false)
  })() }, [])

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      {loading && <p>Lade…</p>}
      {err && <p className="text-red-600">{err}</p>}
      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded p-3">
            <h2 className="font-semibold mb-2">Leads nach Status</h2>
            <ul className="text-sm space-y-1">
              {data.statusCounts.map((s:any,i:number)=>(<li key={i}>{s.status}: <b>{s.count}</b></li>))}
            </ul>
          </div>
          <div className="border rounded p-3">
            <h2 className="font-semibold mb-2">Leads je Manager</h2>
            <ul className="text-sm space-y-1">
              {data.byManager.map((m:any,i:number)=>(<li key={i}>{m.manager_display || m.manager_id}: <b>{m.count}</b></li>))}
            </ul>
          </div>
          <div className="border rounded p-3">
            <h2 className="font-semibold mb-2">Kontakte</h2>
            <ul className="text-sm space-y-1">
              <li>Heute: <b>{data.contacts.today}</b></li>
              <li>Woche: <b>{data.contacts.week}</b></li>
              <li>Monat: <b>{data.contacts.month}</b></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

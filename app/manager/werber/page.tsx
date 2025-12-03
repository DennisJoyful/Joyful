
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Row = { recruiter_id: string, display_name: string, tiktok_handle: string, referral_code: string|null, public_code: string|null, points_total: number }

export default function ManagerWerberPage(){
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string>('')

  useEffect(()=>{ (async()=>{
    setLoading(true); setErr('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setErr('Nicht eingeloggt'); setLoading(false); return }
    const r = await fetch('/api/_admin/proxy?to=/api/manager/werber/overview', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ manager_id: user.id })
    })
    const data = await r.json().catch(()=>({ok:false,error:'keine JSON'}))
    if (!data.ok) setErr(data.error||'Fehler'); else setRows(data.items||[])
    setLoading(false)
  })() }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Meine Werber</h1>
      {loading && <p>Lade…</p>}
      {err && <p className="text-red-600">{err}</p>}
      {!loading && !err && (
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="py-2 px-2">Werber</th>
                <th className="px-2">Handle</th>
                <th className="px-2">Punkte</th>
                <th className="px-2">Ref-Link</th>
                <th className="px-2">Public</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i)=> (
                <tr key={i} className="border-t">
                  <td className="py-2 px-2">{r.display_name}</td>
                  <td className="px-2">@{r.tiktok_handle}</td>
                  <td className="px-2 font-semibold">{r.points_total}</td>
                  <td className="px-2">{r.referral_code ? <code>/sws/apply/{r.referral_code}</code> : '—'}</td>
                  <td className="px-2">{r.public_code ? <code>/werber/{r.public_code}</code> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

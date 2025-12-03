
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function InaktivePage(){
  const [month, setMonth] = useState<string>('')
  const [data, setData] = useState<any>(null)
  const [err, setErr] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const d = new Date(); const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    setMonth(ym)
  }, [])

  async function load(){
    setErr(''); setLoading(true); setData(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setErr('Nicht eingeloggt'); setLoading(false); return }
    const r = await fetch('/api/manager/inactive/metrics', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ manager_id: user.id, month })
    })
    const j = await r.json().catch(()=>({ok:false,error:'keine JSON'}))
    if (!j.ok) setErr(j.error||'Fehler'); else setData(j)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Inaktive Streamer</h1>
      <div className="flex items-center gap-2">
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="border rounded px-2 py-1" />
        <button onClick={load} className="px-3 py-1 border rounded">Laden</button>
      </div>

      {loading && <p>Lade…</p>}
      {err && <p className="text-red-600">{err}</p>}
      {data && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-2">Gar nicht gestreamt (Monat)</h2>
            <table className="w-full text-sm border rounded overflow-hidden">
              <thead className="bg-gray-50"><tr className="text-left"><th className="py-2 px-2">Creator</th><th className="px-2">Monate in Folge</th></tr></thead>
              <tbody>
                {data.itemsA.map((r:any, i:number)=>(
                  <tr key={i} className="border-t"><td className="py-1 px-2">@{r.creator_handle}</td><td className="px-2">{r.months_in_row}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h2 className="font-semibold mb-2">&lt; 7 Tage oder &lt; 15 Stunden</h2>
            <table className="w-full text-sm border rounded overflow-hidden">
              <thead className="bg-gray-50"><tr className="text-left"><th className="py-2 px-2">Creator</th><th className="px-2">Monate in Folge</th><th className="px-2">Tage</th><th className="px-2">Std</th></tr></thead>
              <tbody>
                {data.itemsB.map((r:any, i:number)=>(
                  <tr key={i} className="border-t"><td className="py-1 px-2">@{r.creator_handle}</td><td className="px-2">{r.months_in_row}</td><td className="px-2">{r.days}</td><td className="px-2">{r.hours}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

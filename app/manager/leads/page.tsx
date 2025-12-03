
'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import StatusBadge from '@/components/StatusBadge'
import { LiveDot } from '@/components/LiveDot'

export default function LeadsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const timerRef = useRef<any>(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('leads')
      .select('id, creator_handle, status, live_status, live_checked_at, contact_date, follow_up_date')
      .order('created_at', { ascending: false })
      .limit(200)
    setRows(data || []); setLoading(false)
  }
  useEffect(()=>{ load() }, [])

  // Hintergrund-Livecheck (alle 5s einen Kandidaten, TTL ~2min)
  useEffect(() => {
    timerRef.current = setInterval(async () => {
      const next = rows.find(r => {
        const ttlMs = 2*60*1000
        const last = r.live_checked_at ? new Date(r.live_checked_at).getTime() : 0
        const expired = Date.now() - last > ttlMs
        return r.live_status === 'not_checked' || expired
      })
      if (!next) return
      await fetch(`/api/leads/live-check?leadId=${next.id}`, { method: 'POST' })
      await load()
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [rows])

  async function setContact(id: string, date: string) {
    const follow = new Date(date); follow.setDate(follow.getDate()+5)
    await supabase.from('leads').update({ contact_date: date, follow_up_date: follow.toISOString().slice(0,10) }).eq('id', id)
    await load()
  }
  async function setStatus(id: string, status: string) {
    await supabase.from('leads').update({ status }).eq('id', id); await load()
  }

  const filtered = useMemo(()=> rows.filter(r=>!filterStatus || r.status===filterStatus), [rows, filterStatus])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select className="border rounded px-2 py-1" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">Alle Stati</option>
          <option value="not_contacted">nicht kontaktiert</option>
          <option value="no_response">keine reaktion</option>
          <option value="invited">eingeladen</option>
          <option value="rejected">abgesagt</option>
          <option value="joined">gejoint</option>
        </select>
        <button className="px-3 py-1 border rounded" onClick={load}>Aktualisieren</button>
      </div>

      {loading ? <p>Lade…</p> : (
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b"><th className="py-2">Creator</th><th>Status</th><th>Live</th><th>Kontakt</th><th>Follow-up</th><th>Aktion</th></tr></thead>
          <tbody>
            {filtered.map(r=> (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="py-2 font-medium">@{r.creator_handle}</td>
                <td><StatusBadge status={r.status} /></td>
                <td><LiveDot live={r.live_status} /></td>
                <td>{r.contact_date ?? '—'}</td>
                <td>{r.follow_up_date ?? '—'}</td>
                <td className="space-x-2">
                  <button className="text-xs underline" onClick={()=>setStatus(r.id,'invited')}>eingeladen</button>
                  <button className="text-xs underline" onClick={()=>setStatus(r.id,'joined')}>gejoint</button>
                  <button className="text-xs underline" onClick={()=>{
                    const d = prompt('Kontaktdatum (YYYY-MM-DD)'); if(d) setContact(r.id,d)
                  }}>Kontakt gesetzt</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

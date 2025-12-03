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


useEffect(() => { load() }, [])


async function load() {
setLoading(true)
const { data, error } = await supabase
.from('leads')
.select('id, creator_handle, status, live_status, live_checked_at, contact_date, follow_up_date')
.order('created_at', { ascending: false })
.limit(100)
if (!error) setRows(data || [])
setLoading(false)
}


// Polling: alle 5s wird der nächste Kandidat geprüft
useEffect(() => {
timerRef.current = setInterval(async () => {
const next = rows.find(r => {
if (!r) return false
const ttlMs = 2 * 60 * 1000 // 2 Minuten TTL
const last = r.live_checked_at ? new Date(r.live_checked_at).getTime() : 0
const expired = Date.now() - last > ttlMs
return r.live_status === 'not_checked' || expired
})
if (!next) return
try {
await fetch(`/api/leads/live-check?leadId=${next.id}`, { method: 'POST' })
await load()
} catch {}
}, 5000)
return () => clearInterval(timerRef.current)
}, [rows])


const filtered = useMemo(() => rows.filter(r => !filterStatus || r.status === filterStatus), [rows, filterStatus])


return (
<div className="space-y-4">
<div className="flex items-center gap-2">
<select className="border rounded px-2 py-1" value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}>
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
<thead>
<tr className="text-left border-b">
<th className="py-2">Creator</th>
<th>Status</th>
<th>Live</th>
<th>Kontakt</th>
<th>Follow-up</th>
</tr>
</thead>
<tbody>
{filtered.map(r => (
<tr key={r.id} className="border-b hover:bg-gray-50">
<td className="py-2 font-medium">@{r.creator_handle}</td>
<td><StatusBadge status={r.status} /></td>
<td><LiveDot live={r.live_status} /></td>
<td>{r.contact_date ?? '—'}</td>
<td>{r.follow_up_date ?? '—'}</td>
</tr>
))}
</tbody>
</table>
)}
</div>
)
}

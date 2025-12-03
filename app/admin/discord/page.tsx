
'use client'
import { useState } from 'react'

type Streamer = { creator_id: string; creator_handle: string|null }

export default function DiscordLinkPage(){
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Streamer[]>([])
  const [discordId, setDiscordId] = useState('')
  const [msg, setMsg] = useState('')

  async function search(){
    setMsg('')
    const r = await fetch('/api/_admin/proxy?to=/api/admin/discord/search', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ q }) })
    const j = await r.json().catch(()=>({ok:false,error:'no json'}))
    if (j.ok) setItems(j.items||[]); else setMsg(j.error||'Fehler')
  }

  async function link(creator_id: string, creator_handle: string|null){
    setMsg('')
    const r = await fetch('/api/_admin/proxy?to=/api/admin/discord/link', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ discord_id: discordId, creator_id, creator_handle }) })
    const j = await r.json().catch(()=>({ok:false,error:'no json'}))
    setMsg(j.ok ? 'Verknüpft (oder bereits vorhanden)' : (j.error||'Fehler'))
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Discord-Verknüpfung</h1>
      <div className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="creator_id oder handle" className="border rounded px-3 py-2 flex-1" />
        <button onClick={search} className="px-3 py-2 border rounded">Suchen</button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Discord-ID</span>
        <input value={discordId} onChange={e=>setDiscordId(e.target.value)} placeholder="123456789012345678" className="border rounded px-3 py-2" />
      </div>
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr className="text-left"><th className="py-2 px-2">Creator</th><th className="px-2">Aktion</th></tr></thead>
          <tbody>
            {items.map((s,i)=>(
              <tr key={i} className="border-t">
                <td className="py-1 px-2">@{s.creator_handle} <span className="text-gray-500">({s.creator_id})</span></td>
                <td className="px-2"><button onClick={()=>link(s.creator_id, s.creator_handle)} className="text-blue-700 underline">Verknüpfen</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  )
}


'use client'
import { useEffect, useState } from 'react'

type Rule = { key: string; points: number }

export default function RewardsConfigPage(){
  const [rules, setRules] = useState<Rule[]>([])
  const [msg, setMsg] = useState('')

  async function load(){
    const r = await fetch('/api/_admin/proxy?to=/api/admin/config/rewards/get', { method:'POST' })
    const j = await r.json().catch(()=>({ok:false, error:'no json'}))
    if (j.ok) setRules(j.items||[]); else setMsg(j.error||'Fehler')
  }

  async function save(){
    setMsg('')
    const r = await fetch('/api/_admin/proxy?to=/api/admin/config/rewards/save', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ rules })
    })
    const j = await r.json().catch(()=>({ok:false,error:'no json'}))
    setMsg(j.ok ? 'Gespeichert' : (j.error||'Fehler'))
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Prämien-Konfiguration</h1>
      <table className="w-full text-sm border rounded overflow-hidden">
        <thead className="bg-gray-50"><tr className="text-left"><th className="py-2 px-2">Key</th><th className="px-2">Punkte</th></tr></thead>
        <tbody>
          {rules.map((r,i)=>(
            <tr key={i} className="border-t">
              <td className="py-2 px-2">{r.key}</td>
              <td className="px-2"><input type="number" value={r.points} onChange={e=>{
                const v = parseInt(e.target.value||'0',10); setRules(rs=>rs.map((x,xi)=> xi===i?{...x,points:v}:x))
              }} className="w-28 border rounded px-2 py-1" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={save} className="px-4 py-2 bg-black text-white rounded">Speichern</button>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  )
}

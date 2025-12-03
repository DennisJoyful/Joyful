
'use client'
import { useState } from 'react'

type StartResp = { ok: boolean; headers?: string[]; sheets?: string[]; token?: string; error?: string }
type CommitResp = { ok: boolean; imported?: number; month?: string; error?: string }

export default function ImportXLSXPage(){
  const [file, setFile] = useState<File|null>(null)
  const [month, setMonth] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [sheets, setSheets] = useState<string[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [map, setMap] = useState<Record<string,string>>({ handle:'', creator_id:'', days:'', hours:'', diamonds:'', join_date:'', manager_id:'', public_code:'', rookie:'' })
  const [log, setLog] = useState<string>('')

  async function start(e: React.FormEvent){
    e.preventDefault(); setLog(''); setToken('')
    if (!file) { setLog('Bitte Datei wählen'); return }
    const buf = await file.arrayBuffer()
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
    const r = await fetch('/api/_admin/proxy?to=/api/admin/import/xlsx/start', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ b64 }) })
    const j: StartResp = await r.json().catch(()=>({ok:false,error:'no json'} as any))
    if (!j.ok) { setLog(j.error||'Fehler'); return }
    setHeaders(j.headers||[]); setSheets(j.sheets||[]); setSelectedSheet((j.sheets||[])[0]||''); setToken(j.token||'')
  }

  async function commit(){
    setLog('Import läuft…')
    const r = await fetch('/api/_admin/proxy?to=/api/admin/import/xlsx/commit', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ token, month, sheet: selectedSheet, map })
    })
    const j: CommitResp = await r.json().catch(()=>({ok:false,error:'no json'} as any))
    setLog(j.ok ? `OK: ${j.imported} Zeilen importiert (Monat ${j.month})` : (j.error||'Fehler'))
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">XLSX Import</h1>
      <form onSubmit={start} className="space-y-3">
        <input type="file" accept=".xlsx,.xls" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button className="px-4 py-2 bg-black text-white rounded">Header laden</button>
      </form>

      {headers.length>0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label>Monat</label>
            <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="border rounded px-2 py-1" />
            <label>Sheet</label>
            <select value={selectedSheet} onChange={e=>setSelectedSheet(e.target.value)} className="border rounded px-2 py-1">
              {sheets.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(map).map(k=> (
              <div key={k} className="flex items-center gap-2">
                <label className="w-40 text-sm">{k}</label>
                <select value={map[k]||''} onChange={e=>setMap(m=>({...m,[k]:e.target.value}))} className="border rounded px-2 py-1 flex-1">
                  <option value="">-- nicht zuordnen --</option>
                  {headers.map(h=> <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button disabled={!token || !month} onClick={commit} className="px-4 py-2 bg-black text-white rounded">Import starten</button>
        </div>
      )}

      <pre className="text-xs whitespace-pre-wrap border rounded p-2 bg-gray-50">{log}</pre>
    </div>
  )
}

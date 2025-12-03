
'use client'
import { useState } from 'react'

export default function ImportPage(){
  const [file, setFile] = useState<File|null>(null)
  const [log, setLog] = useState<string>('')
  const [month, setMonth] = useState<string>('')

  async function upload(e: React.FormEvent){
    e.preventDefault()
    if (!file || !month) { setLog('Bitte CSV und Monat (YYYY-MM) wählen.'); return }
    const buf = await file.arrayBuffer()
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
    const r = await fetch('/api/admin/import/csv', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ b64, month }) })
    const txt = await r.text()
    setLog(txt)
  }

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">TikTok CSV Import</h1>
      <form onSubmit={upload} className="space-y-3">
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="border rounded px-3 py-2" />
        <input type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button className="px-4 py-2 bg-black text-white rounded">Import starten</button>
      </form>
      <pre className="text-xs whitespace-pre-wrap border rounded p-2 bg-gray-50">{log}</pre>
    </div>
  )
}

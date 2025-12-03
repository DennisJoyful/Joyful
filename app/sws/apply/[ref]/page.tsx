
'use client'
import { useEffect, useState } from 'react'

export default function ApplyPage({ params }: { params: { ref: string } }) {
  const [status, setStatus] = useState<string>('idle')
  const [creatorHandle, setCreatorHandle] = useState('')
  const [note, setNote] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/applications/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: params.ref, creator_handle: creatorHandle, note })
    })
    const data = await res.json()
    if (data.ok) setStatus('success')
    else setStatus('error')
  }

  useEffect(()=>{ window.scrollTo(0,0) },[])

  if (status === 'success') return (
    <div className="max-w-md space-y-3">
      <h1 className="text-2xl font-semibold">Danke für deine Bewerbung!</h1>
      <p>Wir melden uns bald bei dir.</p>
    </div>
  )

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-4">Bewirb dich als Streamer</h1>
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-sm">Dein TikTok Handle (ohne @)</span>
          <input required value={creatorHandle} onChange={e=>setCreatorHandle(e.target.value)}
                 className="mt-1 w-full border rounded px-3 py-2" placeholder="deinname" />
        </label>
        <label className="block">
          <span className="text-sm">Notiz (optional)</span>
          <textarea value={note} onChange={e=>setNote(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
        </label>
        <button disabled={status==='loading'} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
          {status==='loading' ? 'Sende…' : 'Bewerbung absenden'}
        </button>
      </form>
    </div>
  )
}

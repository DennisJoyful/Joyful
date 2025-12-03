
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  async function send(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: (window as any).SITE_URL || window.location.origin } })
    if (!error) setSent(true)
  }
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-3">Anmelden</h1>
      {sent ? <p>Prüfe deine E-Mail für den Login-Link.</p> : (
        <form onSubmit={send} className="space-y-3">
          <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="du@beispiel.de"
                 className="w-full border rounded px-3 py-2" />
          <button className="px-4 py-2 rounded bg-black text-white">Login-Link senden</button>
        </form>
      )}
    </div>
  )
}

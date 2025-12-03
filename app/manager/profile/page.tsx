
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ManagerProfile() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string>('')
  const [refCode, setRefCode] = useState<string>('')

  useEffect(()=>{ (async()=>{
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setEmail(user.email || '')
      const { data } = await supabase.from('referral_codes')
        .select('code').eq('type','manager').eq('manager_id', user.id).eq('active', true).limit(1)
      if (data && data.length>0) setRefCode(data[0].code)
    }
    setLoading(false)
  })() }, [])

  if (loading) return <p>Lade…</p>
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Mein Profil</h1>
      <p className="text-sm">E-Mail: <b>{email || 'unbekannt'}</b></p>
      {refCode ? (
        <div className="border rounded p-3"><p className="font-medium">Dein Bewerbungslink:</p><code className="break-all">/sws/apply/{refCode}</code></div>
      ) : <p>Noch kein Bewerbungslink vorhanden.</p>}
    </div>
  )
}

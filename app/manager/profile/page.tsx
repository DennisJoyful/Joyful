'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ManagerProfile() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string>('')
  const [refCode, setRefCode] = useState<string>('')

  useEffect(() => {
    (async () => {
      setLoading(true)
      // 1) aktuellen User laden
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setEmail(user.email || '')

      // 2) Referral-Code für diesen Manager laden (RLS erlaubt select nur für manager_id = auth.uid())
      const { data, error } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('type','manager')
        .eq('manager_id', user.id)
        .eq('active', true)
        .limit(1)
      if (!error && data && data.length > 0) setRefCode(data[0].code)
      setLoading(false)
    })()
  }, [])

  if (loading) return <p>Lade…</p>

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Mein Profil</h1>
      <p className="text-sm">Eingeloggt als: <b>{email || 'unbekannt'}</b></p>

      {refCode ? (
        <div className="border rounded p-3 space-y-2">
          <p className="font-medium">Dein Bewerbungslink:</p>
          <code className="block break-all">
            /sws/apply/{refCode}
          </code>
        </div>
      ) : (
        <p>Für deinen Account ist noch kein Bewerbungslink hinterlegt.</p>
      )}
    </div>
  )
}

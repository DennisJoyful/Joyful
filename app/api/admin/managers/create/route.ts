import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

function requireAdmin(req: NextRequest) {
  const got = req.headers.get('authorization') || ''
  const want = `Bearer ${process.env.ADMIN_API_TOKEN || ''}`
  return got === want
}

function randomCode(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2,7).toUpperCase()}`
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 })
  }

  const body = await req.json().catch(()=>null)
  const { display_name, email, tiktok_handle, mode = 'with_email' } = body || {}
  if (!display_name || (mode === 'with_email' && !email) || (mode === 'without_email' && !tiktok_handle)) {
    return NextResponse.json({ ok:false, error:'missing params' }, { status:400 })
  }

  const supa = getServiceClient()
  let managerUserId: string | null = null

  if (mode === 'with_email') {
    // Manager-Account anlegen (Invite) -> liefert user.id
    const invite = await supa.auth.admin.inviteUserByEmail(email as string, {
      redirectTo: process.env.SITE_URL || undefined
    })
    if (invite.error && invite.error.status !== 422) {
      return NextResponse.json({ ok:false, error: invite.error.message }, { status:500 })
    }
    managerUserId = invite.data?.user?.id || null
    if (!managerUserId) {
      return NextResponse.json({ ok:false, error:'could not create/invite user' }, { status:500 })
    }
    // Profile: role=manager
    await supa.from('profiles').upsert({
      id: managerUserId,
      role: 'manager',
      display_name
    })
  } else {
    // ohne Email: "stummer" Manager -> eigener Eintrag in recruiters-ähnlicher Tabelle haben wir nicht;
    // daher legen wir nur einen "Platzhalter" in profiles NICHT an (braucht auth.users.id),
    // und erzeugen NUR einen Referral-Code zum Bewerben.
    // Dieser Manager kann sich NICHT einloggen – sinnvoll nur, wenn Admin Leads/Streamer diesem Manager zuweist.
  }

  // Manager-Referral-Code anlegen (für Bewerbungslink / Zuweisung)
  const code = randomCode('MGR')
  const { error: refErr } = await supa.from('referral_codes').insert({
    code,
    type: 'manager',
    manager_id: managerUserId ?? null,
    active: true
  } as any)
  if (refErr) return NextResponse.json({ ok:false, error: refErr.message }, { status:500 })

  return NextResponse.json({
    ok: true,
    manager_id: managerUserId,
    referral_code: code,
    // Bewerbungslink:
    apply_url: `/sws/apply/${code}`,
    note: mode === 'without_email' ? 'Kein Login möglich, da ohne Email' : undefined
  })
}

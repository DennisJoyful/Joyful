
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

function requireAdmin(req: NextRequest) {
  const got = req.headers.get('authorization') || ''
  const want = `Bearer ${process.env.ADMIN_API_TOKEN || ''}`
  return got === want && want !== 'Bearer '
}

function randomCode(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2,7).toUpperCase()}`
}

export async function OPTIONS() {
  // allow preflight
  return NextResponse.json({ ok:true, route: 'admin/managers/create', method: 'OPTIONS' })
}

export async function GET(req: NextRequest) {
  const ok = requireAdmin(req)
  return NextResponse.json({ ok, route: 'admin/managers/create', method: 'GET' }, { status: ok ? 200 : 401 })
}

export async function POST(req: NextRequest) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 })
    }

    const body = await req.json().catch(() => null)
    const { display_name, email, tiktok_handle, mode = 'with_email' } = body || {}
    if (!display_name || (mode === 'with_email' && !email) || (mode === 'without_email' && !tiktok_handle)) {
      return NextResponse.json({ ok:false, error:'missing params' }, { status:400 })
    }

    const supa = getServiceClient()
    let managerUserId: string | null = null

    if (mode === 'with_email') {
      const invite = await supa.auth.admin.inviteUserByEmail(email as string, {
        redirectTo: process.env.SITE_URL || undefined,
      })
      if (invite.error && invite.error.status !== 422) {
        return NextResponse.json({ ok:false, error: invite.error.message }, { status:500 })
      }
      managerUserId = invite.data?.user?.id || null
      if (!managerUserId) {
        return NextResponse.json({ ok:false, error:'could not create/invite user' }, { status:500 })
      }
      await supa.from('profiles').upsert({
        id: managerUserId,
        role: 'manager',
        display_name,
      })
    }

    const code = randomCode('MGR')
    const { error: refErr } = await supa.from('referral_codes').insert({
      code,
      type: 'manager',
      manager_id: managerUserId,
      active: true,
    } as any)
    if (refErr) {
      return NextResponse.json({ ok:false, error: refErr.message }, { status:500 })
    }

    return NextResponse.json({
      ok: true,
      manager_id: managerUserId,
      referral_code: code,
      apply_url: `/sws/apply/${code}`,
      note: mode === 'without_email' ? 'Kein Login möglich, da ohne Email' : undefined,
    })
  } catch (err: any) {
    return NextResponse.json({ ok:false, error: err?.message || 'unexpected error' }, { status:500 })
  }
}

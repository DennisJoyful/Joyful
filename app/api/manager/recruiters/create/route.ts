
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'
function code(prefix: string){ return `${prefix}-${Math.random().toString(36).slice(2,7).toUpperCase()}` }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>null)
  const { handle, display_name, manager_id } = body || {}
  if (!handle || !display_name || !manager_id) return NextResponse.json({ ok:false, error:'missing params' }, { status:400 })
  const supa = getServiceClient()
  const { data: rec, error: recErr } = await supa.from('recruiters').insert({ tiktok_handle: handle, display_name, manager_id }).select('id').single()
  if (recErr) return NextResponse.json({ ok:false, error: recErr.message }, { status:500 })
  const referral = code('WRB'); const publicCode = code('PUB')
  const { error: refErr } = await supa.from('referral_codes').insert({ code: referral, type: 'werber', manager_id, active: true, recruiter_id: rec.id } as any)
  if (refErr) return NextResponse.json({ ok:false, error: refErr.message }, { status:500 })
  await supa.from('recruiters').update({ public_code: publicCode }).eq('id', rec.id)
  return NextResponse.json({ ok:true, recruiter_id: rec.id, referral_code: referral, public_code: publicCode })
}

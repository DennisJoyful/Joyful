
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { ref, creator_handle, note } = body || {}
  if (!ref || !creator_handle) {
    return NextResponse.json({ ok: false, error: 'missing params' }, { status: 400 })
  }

  const supa = getServiceClient()

  const { data: refRow, error: refErr } = await supa
    .from('referral_codes')
    .select('type, manager_id, werber_id, active')
    .eq('code', ref).single()
  if (refErr || !refRow || !refRow.active) {
    return NextResponse.json({ ok: false, error: 'ref not found or inactive' }, { status: 404 })
  }

  const managerId = refRow.manager_id

  const { data: lead } = await supa
    .from('leads')
    .insert({
      creator_handle,
      source: 'sws',
      manager_id: managerId,
      created_by: managerId,
      status: 'not_contacted',
      notes: note ?? null,
    })
    .select('id').single()

  return NextResponse.json({ ok: true, leadId: lead?.id || null })
}

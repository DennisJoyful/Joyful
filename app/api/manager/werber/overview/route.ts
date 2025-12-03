
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>null)
  const { manager_id } = body || {}
  if (!manager_id) return NextResponse.json({ ok:false, error:'missing manager_id' }, { status:400 })
  const supa = getServiceClient()

  const { data: recs } = await supa.from('recruiters')
    .select('id, display_name, tiktok_handle, public_code')
    .eq('manager_id', manager_id)

  const ids = (recs||[]).map(r=>r.id)
  let pointsBy: Record<string, number> = {}
  if (ids.length){
    const { data: sums } = await supa.rpc('sum_points_by_recruiter', { rid_list: ids }) as any
    for (const row of (sums||[])) pointsBy[row.recruiter_id] = row.total_points || 0
  }

  const { data: refs } = await supa.from('referral_codes').select('code, recruiter_id').in('recruiter_id', ids)
  const refBy: Record<string, string> = {}
  for (const r of (refs||[])) if (r.recruiter_id) refBy[r.recruiter_id] = r.code

  const items = (recs||[]).map(r => ({
    recruiter_id: r.id,
    display_name: r.display_name,
    tiktok_handle: r.tiktok_handle,
    referral_code: refBy[r.id] || null,
    public_code: r.public_code || null,
    points_total: pointsBy[r.id] || 0
  }))

  return NextResponse.json({ ok:true, items })
}

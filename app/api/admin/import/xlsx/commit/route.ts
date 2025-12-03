
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>null)
  const { token, month, sheet, map } = body || {}
  if (!token || !month) return NextResponse.json({ ok:false, error:'missing token/month' }, { status:400 })

  const supa = getServiceClient()

  const raw = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))
  const b64 = raw.b64 as string
  const { default: XLSX } = await import('xlsx')
  const wb = XLSX.read(Buffer.from(b64, 'base64'), { type: 'buffer' })
  const ws = wb.Sheets[sheet || wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws) as any[]

  let imported = 0
  for (const r of rows){
    const creator_handle = map.handle ? String(r[map.handle]||'').trim() : null
    const creator_id = map.creator_id ? String(r[map.creator_id]||'').trim() : null
    if (!creator_id && !creator_handle) continue

    const days = map.days ? parseInt(String(r[map.days]||'0'),10) : null
    const hours = map.hours ? parseFloat(String(r[map.hours]||'0')) : null
    const diamonds = map.diamonds ? parseInt(String(r[map.diamonds]||'0'),10) : null
    const join_date = map.join_date ? new Date(r[map.join_date]).toISOString().slice(0,10) : null
    const manager_id = map.manager_id ? String(r[map.manager_id]||'').trim() : null
    const public_code = map.public_code ? String(r[map.public_code]||'').trim() : null
    const rookie = map.rookie ? (String(r[map.rookie]||'').toLowerCase() in {'1':1,'true':1,'yes':1,'ja':1}) : false

    await supa.from('monthly_stats').upsert({
      month,
      creator_id: creator_id || creator_handle,
      creator_handle,
      days_streamed: days,
      hours_streamed: hours,
      diamonds,
      join_date
    }, { onConflict: 'month,creator_id' })

    if (creator_id){
      const join_month = join_date ? join_date.slice(0,7) : null
      await supa.from('streamers').upsert({
        creator_id, creator_handle, join_month, rookie
      }, { onConflict: 'creator_id' })
    }

    if (creator_id && (manager_id || public_code)){
      let recruiter_id: string | null = null
      if (public_code){
        const { data: rec } = await supa.from('recruiters').select('id').eq('public_code', public_code).maybeSingle()
        recruiter_id = rec?.id || null
      }
      await supa.from('streamers').update({
        manager_id: manager_id || undefined,
        recruiter_id: recruiter_id || undefined
      }).eq('creator_id', creator_id)
    }

    imported++
  }

  return NextResponse.json({ ok:true, imported, month })
}


import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

function ymAdd(ym: string, d: number){
  const [y,m] = ym.split('-').map(Number)
  const idx = y*12 + (m-1) + d
  const ny = Math.floor(idx/12), nm = (idx%12)+1
  return `${ny}-${String(nm).padStart(2,'0')}`
}
function isActive(row:any){ return (row?.days_streamed||0) >= 7 && (row?.hours_streamed||0) >= 15 }

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>null)
  const { month, mode = 'dry' } = body || {}
  if (!month) return NextResponse.json({ ok:false, error:'missing month YYYY-MM' }, { status:400 })
  const supa = getServiceClient()

  const { data: stats } = await supa.from('monthly_stats').select('*').eq('month', month)
  const { data: streamers } = await supa.from('streamers').select('creator_id, manager_id, recruiter_id, join_month, rookie')
  const map = new Map<string, any>(); for (const s of (streamers||[])) map.set(s.creator_id, s)

  const ledger: any[] = []

  for (const row of (stats||[])){
    const s = map.get(row.creator_id); if (!s) continue
    const firstFull = s.join_month
    // Aktiv im ersten vollen Monat
    if (firstFull && month === firstFull && isActive(row)){
      ledger.push({ points: 500, reason: 'Aktiv 7/15 im ersten vollen Monat', creator_id: row.creator_id })
    }
    // 3 Monate 7/15 ab erstem vollen Monat
    if (firstFull){
      const seq = [0,1,2].map(d=>ymAdd(firstFull, d))
      if (seq[2] === month){
        const checks = await Promise.all(seq.map(async mo => {
          const { data } = await supa.from('monthly_stats').select('*').eq('month', mo).eq('creator_id', row.creator_id).maybeSingle()
          return isActive(data||{})
        }))
        if (checks.every(Boolean)) ledger.push({ points: 100, reason: '3 Folgemonate 7/15', creator_id: row.creator_id })
      }
    }
    // Diamanten innerhalb der ersten 3 vollen Monate
    if (s.join_month){
      const seq = [0,1,2].map(d=>ymAdd(s.join_month, d))
      const idx = seq.indexOf(month)
      if (idx !== -1){
        const dms = row.diamonds||0
        if (dms >= 50000) ledger.push({ points: 300, reason: '50k Diamanten innerhalb 3 Monate', creator_id: row.creator_id })
        else if (dms >= 15000) ledger.push({ points: 150, reason: '15k Diamanten innerhalb 3 Monate', creator_id: row.creator_id })
      }
    }
    // Rookie 150k im Monat
    if (s.rookie && (row.diamonds||0) >= 150000){
      ledger.push({ points: 3500, reason: 'Rookie: 150k Diamanten in einem Monat', creator_id: row.creator_id })
    }
  }

  // Werber-Bonus je 5 aktive im Monat
  const activeCreators = (stats||[]).filter(isActive).map(r=>r.creator_id)
  const byRec: Record<string, number> = {}
  for (const cid of activeCreators){
    const s = map.get(cid); const rid = s?.recruiter_id; if (rid) byRec[rid] = (byRec[rid]||0)+1
  }
  for (const rid of Object.keys(byRec)){
    const units = Math.floor(byRec[rid] / 5)
    if (units>0) ledger.push({ points: units*500, reason: `Werber-Bonus: ${byRec[rid]} aktive (7/15)`, recruiter_id: rid })
  }

  if (mode === 'dry') return NextResponse.json({ ok:true, month, preview: ledger })

  for (const e of ledger){
    await supa.from('points_ledger').insert({
      points: e.points, reason: e.reason, created_at: new Date().toISOString(),
      creator_id: e.creator_id || null, month, recruiter_id: e.recruiter_id || null
    } as any)
  }
  return NextResponse.json({ ok:true, booked: ledger.length })
}

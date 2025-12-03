
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

  const { data: rules } = await supa.from('reward_rules').select('key, points')
  const map: Record<string, number> = {}; for (const r of (rules||[])) map[r.key]=r.points

  const R = {
    FFM: map['first_full_month_active'] ?? 500,
    THREE: map['three_consecutive_months_active'] ?? 100,
    D15: map['diamonds_15k'] ?? 150,
    D50: map['diamonds_50k'] ?? 300,
    ROOKIE: map['rookie_150k'] ?? 3500,
    RB5: map['recruiter_bonus_per_5_actives'] ?? 500
  }

  const { data: stats } = await supa.from('monthly_stats').select('*').eq('month', month)
  const { data: streamers } = await supa.from('streamers').select('creator_id, manager_id, recruiter_id, join_month, rookie')
  const mapS = new Map<string, any>(); for (const s of (streamers||[])) mapS.set(s.creator_id, s)

  const ledger: any[] = []

  for (const row of (stats||[])){
    const s = mapS.get(row.creator_id); if (!s) continue
    const firstFull = s.join_month
    if (firstFull && month === firstFull && isActive(row)){
      ledger.push({ points: R.FFM, reason: 'Aktiv 7/15 im ersten vollen Monat', creator_id: row.creator_id })
    }
    if (firstFull){
      const seq = [0,1,2].map(d=>ymAdd(firstFull, d))
      if (seq[2] === month){
        const checks = await Promise.all(seq.map(async mo => {
          const { data } = await supa.from('monthly_stats').select('*').eq('month', mo).eq('creator_id', row.creator_id).maybeSingle()
          return isActive(data||{})
        }))
        if (checks.every(Boolean)) ledger.push({ points: R.THREE, reason: '3 Folgemonate 7/15', creator_id: row.creator_id })
      }
    }
    if (s.join_month){
      const seq = [0,1,2].map(d=>ymAdd(s.join_month, d))
      if (seq.includes(month)){
        const dms = row.diamonds||0
        if (dms >= 50000) ledger.push({ points: R.D50, reason: '50k Diamanten innerhalb 3 Monate', creator_id: row.creator_id })
        else if (dms >= 15000) ledger.push({ points: R.D15, reason: '15k Diamanten innerhalb 3 Monate', creator_id: row.creator_id })
      }
    }
    if (s.rookie && (row.diamonds||0) >= 150000){
      ledger.push({ points: R.ROOKIE, reason: 'Rookie: 150k Diamanten in einem Monat', creator_id: row.creator_id })
    }
  }

  const activeCreators = (stats||[]).filter(isActive).map(r=>r.creator_id)
  const byRec: Record<string, number> = {}
  for (const cid of activeCreators){
    const s = mapS.get(cid); const rid = s?.recruiter_id; if (rid) byRec[rid] = (byRec[rid]||0)+1
  }
  for (const rid of Object.keys(byRec)){
    const units = Math.floor(byRec[rid] / 5)
    if (units>0) ledger.push({ points: units*R.RB5, reason: `Werber-Bonus: ${byRec[rid]} aktive (7/15)`, recruiter_id: rid })
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

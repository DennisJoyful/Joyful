
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

function ym(dateStr: string){ return (dateStr||'').slice(0,7) }

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>null)
  const { month, mode = 'dry' } = body || {}
  if (!month) return NextResponse.json({ ok:false, error:'missing month YYYY-MM' }, { status:400 })
  const supa = getServiceClient()

  // Hole Monatsdaten
  const { data: stats } = await supa.from('monthly_stats').select('*').eq('month', month)
  const { data: streamers } = await supa.from('streamers').select('id, creator_id, manager_id, assigned_werber_id, recruiter_id, join_month')
  const byCreator = new Map<string, any>()
  for (const s of streamers||[]) byCreator.set(s.creator_id, s)

  const ledgerEntries: any[] = []
  const isActive = (row:any) => (row?.days_streamed||0) >= 7 && (row?.hours_streamed||0) >= 15

  for (const row of stats||[]){
    const s = byCreator.get(row.creator_id)
    if (!s) continue
    const firstFull = s.join_month // vorausgefüllt als YYYY-MM
    const m = month

    // Regeln
    // Aktiv im ersten vollen Monat: +500
    if (firstFull && m === firstFull && isActive(row)){
      ledgerEntries.push({ pts: 500, reason: 'Aktiv 7/15 im ersten vollen Monat', creator_id: row.creator_id, month })
    }
    // 3 Monate in Folge ab erstem vollen Monat 7/15: +100 (wenn m ist firstFull+2)
    if (firstFull){
      const [y,mm]=firstFull.split('-').map(Number)
      const idx = (y*12 + (mm-1)) + 2
      const [my, mmm] = month.split('-').map(Number)
      const midx = my*12 + (mmm-1)
      if (midx===idx){
        // check drei Monate
        const months = [0,1,2].map(d=>{
          const ny = Math.floor((y*12+(mm-1)+d)/12)
          const nmo = (y*12+(mm-1)+d)%12 + 1
          return `${ny}-${String(nmo).padStart(2,'0')}`
        })
        const act = await Promise.all(months.map(async mo => {
          const { data } = await supa.from('monthly_stats').select('*').eq('month',mo).eq('creator_id', row.creator_id).maybeSingle()
          return isActive(data||{})
        }))
        if (act.every(Boolean)) ledgerEntries.push({ pts: 100, reason: '3 Folgemonate 7/15', creator_id: row.creator_id, month })
      }
    }
    // Diamanten innerhalb der ersten 3 vollen Monate
    if (firstFull){
      const [fy,fm]=firstFull.split('-').map(Number)
      const [my,mm]=month.split('-').map(Number)
      const delta = (my*12+(mm-1)) - (fy*12+(fm-1))
      if (delta>=0 && delta<=2){
        const d = row.diamonds||0
        if (d>=50000) ledgerEntries.push({ pts: 300, reason: '50k Diamanten innerhalb 3 Monate', creator_id: row.creator_id, month })
        else if (d>=15000) ledgerEntries.push({ pts: 150, reason: '15k Diamanten innerhalb 3 Monate', creator_id: row.creator_id, month })
      }
    }
    // Rookie 150k im Monat (vereinfachend: wenn streamer als rookie markiert wäre; hier ausgelassen)
  }

  // Werber-Bonus: je 5 aktive geworbene +500
  // Wir gruppieren nach recruiter_id
  const activeCreators = (stats||[]).filter(isActive).map(r=>r.creator_id)
  const byRecruiter: Record<string, number> = {}
  for (const c of activeCreators){
    const s = byCreator.get(c); if (!s) continue
    const rid = s.recruiter_id; if (!rid) continue
    byRecruiter[rid] = (byRecruiter[rid]||0)+1
  }
  for (const rid of Object.keys(byRecruiter)){
    const count = byRecruiter[rid]
    const bonusUnits = Math.floor(count / 5)
    if (bonusUnits>0){
      ledgerEntries.push({ pts: bonusUnits*500, reason: f'Werber-Bonus: {count} aktive (7/15)', recruiter_id: rid, month })
    }
  }

  if (mode === 'dry') {
    return NextResponse.json({ ok:true, month, preview: ledgerEntries })
  }

  // commit: schreibe points_ledger
  for (const e of ledgerEntries){
    await supa.from('points_ledger').insert({
      points: e.pts, reason: e.reason, created_at: new Date().toISOString(),
      creator_id: e.creator_id || null,
      month,
      recruiter_id: e.recruiter_id || null
    } as any)
  }
  return NextResponse.json({ ok:true, month, booked: ledgerEntries.length })
}

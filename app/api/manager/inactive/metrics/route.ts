
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

function ymAdd(ym: string, d: number){
  const [y,m] = ym.split('-').map(Number)
  const idx = y*12 + (m-1) + d
  const ny = Math.floor(idx/12), nm = (idx%12)+1
  return `${ny}-${String(nm).padStart(2,'0')}`
}

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>null)
  const { manager_id, month } = body || {}
  if (!manager_id || !month) return NextResponse.json({ ok:false, error:'missing manager_id/month' }, { status:400 })
  const supa = getServiceClient()

  // hole alle Streamer des Managers
  const { data: streamers } = await supa.from('streamers')
    .select('creator_id, creator_handle')
    .eq('manager_id', manager_id)

  const creators = (streamers||[]).map(s=>s.creator_id)
  if (!creators.length) return NextResponse.json({ ok:true, itemsA:[], itemsB:[] })

  // hole stats für 6 Monate bis month
  const months = [-5,-4,-3,-2,-1,0].map(d=>ymAdd(month,d))
  const { data: stats } = await supa.from('monthly_stats')
    .select('*')
    .in('creator_id', creators)
    .in('month', months)

  const by = new Map<string, any[]>()
  for (const s of stats||[]) {
    if (!by.has(s.creator_id)) by.set(s.creator_id, [])
    by.get(s.creator_id)!.push(s)
  }

  const itemsA:any[] = [] // ≥1 Monat 0 Tage => "gar nicht gestreamt"
  const itemsB:any[] = [] // <7 Tage ODER <15 Stunden

  for (const s of (streamers||[])) {
    const rows = (by.get(s.creator_id) || []).sort((a,b)=> a.month.localeCompare(b.month))
    const curr = rows.find(r=>r.month===month)
    const zero = rows.reverse().find(r=> (r.days_streamed||0)===0 )
    let consecA = 0
    if (zero){
      // zähle aufeinanderfolgende Monate mit 0 ab aktueller Periode rückwärts
      let idx = months.indexOf(month)
      while (idx>=0){
        const mo = months[idx]
        const r = rows.find(x=>x.month===mo)
        if (r && (r.days_streamed||0)===0) { consecA++; idx-- } else break
      }
    }
    if (curr && (curr.days_streamed||0)===0){
      itemsA.push({ creator_id: s.creator_id, creator_handle: s.creator_handle, months_in_row: consecA })
    }

    if (curr){
      const low = (curr.days_streamed||0) < 7 || (curr.hours_streamed||0) < 15
      if (low){
        // zähle aufeinanderfolgende Monate mit low
        let consec = 0; let idx = months.indexOf(month)
        while (idx>=0){
          const mo = months[idx]; const r = rows.find(x=>x.month===mo)
          if (!r) break
          const l = (r.days_streamed||0) < 7 || (r.hours_streamed||0) < 15
          if (l) { consec++; idx-- } else break
        }
        itemsB.push({ creator_id: s.creator_id, creator_handle: s.creator_handle, months_in_row: consec, days: curr.days_streamed||0, hours: curr.hours_streamed||0 })
      }
    }
  }

  // Sortierung: A nach months_in_row desc, B nach months_in_row desc
  itemsA.sort((a,b)=> b.months_in_row - a.months_in_row || a.creator_handle.localeCompare(b.creator_handle))
  itemsB.sort((a,b)=> b.months_in_row - a.months_in_row || a.creator_handle.localeCompare(b.creator_handle))

  return NextResponse.json({ ok:true, itemsA, itemsB, month })
}

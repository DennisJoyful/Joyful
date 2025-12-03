
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'
import { parseCSV } from '@/lib/csv'

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>null)
  const { b64, month } = body || {}
  if (!b64 || !month) return NextResponse.json({ ok:false, error:'missing b64/month' }, { status:400 })
  const text = Buffer.from(b64, 'base64').toString('utf8')
  const { headers, rows } = parseCSV(text)
  // Erwartete Spaltennamen (bitte anpassen an deinen Export)
  // Wir versuchen heuristisch zu finden:
  const getIdx = (name: string) => headers.findIndex(h => h.toLowerCase().includes(name))
  const idxHandle = getIdx('handle')
  const idxCreatorId = getIdx('creator') // creator_id
  const idxDays = getIdx('tage') !== -1 ? getIdx('tage') : getIdx('days')
  const idxHours = getIdx('stunden') !== -1 ? getIdx('stunden') : getIdx('hours')
  const idxDiamonds = getIdx('diamant') !== -1 ? getIdx('diamant') : getIdx('diamond')
  const idxJoin = getIdx('beitritt') !== -1 ? getIdx('beitritt') : getIdx('join')
  if (idxHandle===-1 || idxCreatorId===-1) return NextResponse.json({ ok:false, error:'Spalten handle/creator fehlen' }, { status:400 })

  const supa = getServiceClient()
  let ok = 0
  for (const row of rows){
    const creator_handle = row[idxHandle]
    const creator_id = row[idxCreatorId]
    const days = idxDays===-1 ? null : parseInt(row[idxDays]||'0',10)
    const hours = idxHours===-1 ? null : parseFloat(row[idxHours]||'0')
    const diamonds = idxDiamonds===-1 ? null : parseInt(row[idxDiamonds]||'0',10)
    const join_date = idxJoin===-1 ? null : row[idxJoin]

    await supa.from('monthly_stats').upsert({
      month,
      creator_id,
      creator_handle,
      days_streamed: days,
      hours_streamed: hours,
      diamonds,
      join_date
    }, { onConflict: 'month,creator_id' })
    ok++
  }
  return NextResponse.json({ ok:true, imported: ok, month, headers })
}

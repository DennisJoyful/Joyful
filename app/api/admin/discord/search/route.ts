
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>null)
  const q = (body?.q||'').toString().trim()
  if (!q) return NextResponse.json({ ok:false, error:'missing q' }, { status:400 })
  const supa = getServiceClient()
  let rows: any[] = []
  if (q.startsWith('@')){
    const handle = q.slice(1)
    const { data } = await supa.from('streamers').select('creator_id, creator_handle').eq('creator_handle', handle)
    rows = data||[]
  } else if (q.length > 25){
    const { data } = await supa.from('streamers').select('creator_id, creator_handle').eq('creator_id', q)
    rows = data||[]
  } else {
    const { data } = await supa.from('streamers').select('creator_id, creator_handle').ilike('creator_handle', `%${q}%`).limit(50)
    rows = data||[]
  }
  return NextResponse.json({ ok:true, items: rows })
}

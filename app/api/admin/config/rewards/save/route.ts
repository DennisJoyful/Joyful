
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>null)
  const rules = (body?.rules||[]) as { key:string, points:number }[]
  const supa = getServiceClient()
  for (const r of rules){
    await supa.from('reward_rules').upsert({ key: r.key, points: r.points })
  }
  return NextResponse.json({ ok:true })
}

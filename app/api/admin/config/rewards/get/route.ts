
import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

export async function POST(){
  const supa = getServiceClient()
  const { data } = await supa.from('reward_rules').select('key, points').order('key')
  return NextResponse.json({ ok:true, items: data||[] })
}

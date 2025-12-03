
import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

export async function POST(req: NextRequest){
  const body = await req.json().catch(()=>null)
  const { discord_id, creator_id, creator_handle } = body || {}
  if (!discord_id || !creator_id) return NextResponse.json({ ok:false, error:'missing fields' }, { status:400 })
  const supa = getServiceClient()
  const { data, error } = await supa.rpc('set_discord_link', { p_discord_id: discord_id, p_creator_id: creator_id, p_creator_handle: creator_handle||null })
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 })
  return NextResponse.json({ ok:true, linked: data })
}

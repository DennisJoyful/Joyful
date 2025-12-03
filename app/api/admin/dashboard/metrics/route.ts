
import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'

export async function POST(){
  const supa = getServiceClient()
  // Status counts
  const { data: statusRows } = await supa.rpc('leads_status_counts')
  // By manager
  const { data: byManager } = await supa.rpc('leads_by_manager')
  // Contacts
  const { data: contacts } = await supa.rpc('lead_contacts_stats')
  return NextResponse.json({ ok:true, statusCounts: statusRows||[], byManager: byManager||[], contacts: contacts||{today:0,week:0,month:0} })
}

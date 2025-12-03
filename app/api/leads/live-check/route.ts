import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/serverSupabase'


function extractIsLive(html: string) {
// Heuristik: nach LIVE-Badges/Strings suchen (robust & unkritisch)
const needles = [
'>LIVE<', 'is LIVE', 'data-e2e="live-icon"', 'aria-label="Live"'
]
const lower = html.toLowerCase()
return needles.some(n => lower.includes(n.toLowerCase()))
}


export async function POST(req: NextRequest) {
const { searchParams } = new URL(req.url)
const leadId = searchParams.get('leadId')
if (!leadId) return NextResponse.json({ ok: false, error: 'leadId missing' }, { status: 400 })


const supa = getServiceClient()
const { data: lead } = await supa.from('leads').select('id, creator_handle').eq('id', leadId).single()
if (!lead) return NextResponse.json({ ok: false, error: 'lead not found' }, { status: 404 })


const url = `https://www.tiktok.com/@${encodeURIComponent(lead.creator_handle)}`
let live: 'onair'|'offline' = 'offline'
try {
const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
const html = await res.text()
if (extractIsLive(html)) live = 'onair'
} catch {
// bei Fehler: konservativ offline belassen
}


await supa.from('leads')
.update({ live_status: live, live_checked_at: new Date().toISOString() })
.eq('id', leadId)


return NextResponse.json({ ok: true, status: live })
}

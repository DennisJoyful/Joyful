
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const u = new URL(req.url)
    const target = u.searchParams.get('to')
    if (!target) return NextResponse.json({ ok:false, error:'missing "to"' }, { status:400 })
    const body = await req.text()
    const upstream = await fetch(new URL(target, u.origin).toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN || ''}`,
        'Content-Type': req.headers.get('content-type') || 'application/json',
      },
      body,
    })
    const text = await upstream.text()
    let data: any; try { data = JSON.parse(text) } catch { data = { passthrough: text } }
    if (!upstream.ok) {
      return NextResponse.json({ ok:false, status: upstream.status, error: data?.error || 'upstream error', details: data?.passthrough || '' }, { status: upstream.status })
    }
    return NextResponse.json(typeof data==='object' ? { ok:true, ...data } : { ok:true, data })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'proxy failure' }, { status:500 })
  }
}

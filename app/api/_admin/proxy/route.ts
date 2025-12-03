
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const u = new URL(req.url)
    const target = u.searchParams.get('to')
    const overrideMethod = (u.searchParams.get('m') || '').toUpperCase()
    if (!target) {
      return NextResponse.json({ ok:false, error:'missing "to" param' }, { status:400 })
    }

    const bodyText = await req.text()
    const method = overrideMethod || req.method || 'POST'

    const upstream = await fetch(new URL(target, u.origin).toString(), {
      method,
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN || ''}`,
        'Content-Type': req.headers.get('content-type') || 'application/json',
      },
      body: method === 'GET' || method === 'HEAD' ? undefined : bodyText,
    })

    const txt = await upstream.text()
    let data: any
    try { data = JSON.parse(txt) } catch { data = { passthrough: txt } }

    if (!upstream.ok) {
      return NextResponse.json({
        ok: false,
        status: upstream.status,
        error: data?.error || 'upstream error',
        details: data?.passthrough ? String(data.passthrough).slice(0,300) : undefined,
        methodUsed: method,
        target
      }, { status: upstream.status })
    }

    if (typeof data === 'object' && data !== null) {
      if (data.ok === undefined) data.ok = true
      return NextResponse.json({ ...data, methodUsed: method, target }, { status: upstream.status })
    }
    return NextResponse.json({ ok:true, data, methodUsed: method, target }, { status: upstream.status })

  } catch (err: any) {
    return NextResponse.json({ ok:false, error: err?.message || 'proxy failure' }, { status:500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

// Proxy nur für Admin-Frontends – hängt den Token serverseitig an
export async function POST(req: NextRequest) {
  const u = new URL(req.url)
  const target = u.searchParams.get('to') // z.B. /api/admin/managers/create
  if (!target) return NextResponse.json({ ok:false, error:'missing to' }, { status:400 })

  const body = await req.text()
  const res = await fetch(new URL(target, u.origin).toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ADMIN_API_TOKEN || ''}`,
      'Content-Type': req.headers.get('content-type') || 'application/json'
    },
    body
  })
  const data = await res.text()
  return new NextResponse(data, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' } })
}

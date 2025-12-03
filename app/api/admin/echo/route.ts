
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const got = req.headers.get('authorization') || ''
  const want = `Bearer ${process.env.ADMIN_API_TOKEN || ''}`
  const authOk = got === want && want !== 'Bearer '
  return NextResponse.json({ ok: true, route: 'admin/echo', method: 'POST', authOk, body })
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true, route: 'admin/echo', method: 'OPTIONS' })
}

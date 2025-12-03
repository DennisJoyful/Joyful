
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const got = req.headers.get('authorization') || ''
  const want = `Bearer ${process.env.ADMIN_API_TOKEN || ''}`
  const authOk = got === want && want !== 'Bearer '
  return NextResponse.json({ ok: true, route: 'admin/ping', method: 'GET', authOk })
}

import { NextResponse } from 'next/server'
export async function GET() {
  const t = process.env.ADMIN_API_TOKEN || ''
  return NextResponse.json({ hasToken: !!t, len: t.length })
}

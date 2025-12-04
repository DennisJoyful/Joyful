import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle') || '';
  if (!handle) return NextResponse.json({ exists: false });
  try {
    const resp = await fetch('https://www.tiktok.com/@' + encodeURIComponent(handle), { method: 'HEAD' });
    const ok = resp.status >= 200 && resp.status < 400;
    return NextResponse.json({ exists: ok });
  } catch (e) {
    return NextResponse.json({ exists: false });
  }
}

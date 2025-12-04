import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function norm(s: string) {
  return s.replace(/^@/, '').trim().toLowerCase();
}

async function checkWebApi(handle: string) {
  const url = `https://www.tiktok.com/api/user/detail/?uniqueId=${encodeURIComponent(handle)}`;
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      'accept': 'application/json,text/plain,*/*',
      'referer': `https://www.tiktok.com/@${handle}`,
      'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store'
  });
  if (!res.ok) return { ok: false, via: 'webapi', status: res.status };
  const j = await res.json().catch(()=>null) as any;
  const found = j?.userInfo?.user?.uniqueId;
  if (found && norm(found) === norm(handle)) return { ok: true, via: 'webapi' };
  return { ok: false, via: 'webapi' };
}

function extractHandleFromHtml(html: string): string | null {
  const canon = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || '';
  const og = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1] || '';
  const url = (canon || og).toLowerCase();
  if (url.includes('/@')) {
    const x = url.split('/@')[1].split(/[/?#]/)[0];
    return x;
  }
  return null;
}

async function checkHtml(handle: string) {
  const urls = [
    `https://www.tiktok.com/@${encodeURIComponent(handle)}`,
    `https://www.tiktok.com/@${encodeURIComponent(handle)}?lang=en`,
    `https://m.tiktok.com/@${encodeURIComponent(handle)}`,
  ];
  const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
    'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  } as Record<string,string>;
  for (const u of urls) {
    try {
      const res = await fetch(u, { headers, redirect: 'follow', cache: 'no-store' });
      if (!res.ok) continue;
      const html = await res.text();
      const found = extractHandleFromHtml(html);
      if (found && norm(found) === norm(handle)) return { ok: true, via: 'html' };
      if (found) return { ok: false, via: 'html-mismatch', found };
    } catch {}
  }
  return { ok: false, via: 'html' };
}

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get('handle') || '').trim();
  if (!raw) return NextResponse.json({ exists: false, reason: 'empty' });
  const handle = raw.replace(/^@/, '');

  // 1) TikTok web API
  const a = await checkWebApi(handle);
  if (a.ok) return NextResponse.json({ exists: true, via: a.via });

  // 2) Fallback HTML
  const b = await checkHtml(handle);
  if ((b as any).ok) return NextResponse.json({ exists: true, via: (b as any).via });

  return NextResponse.json({ exists: false, via: (b as any).via || a.via });
}

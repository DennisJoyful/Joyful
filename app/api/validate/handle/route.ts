import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function norm(h: string) {
  return h.replace(/^@/, '').trim().toLowerCase();
}

async function tryOEmbed(handle: string) {
  const url = `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${encodeURIComponent(handle)}`;
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      'accept': 'application/json,text/*;q=0.8,*/*;q=0.5'
    },
    // TikTok sometimes blocks HEAD, so use GET
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store'
  });
  if (!res.ok) return { ok: false };
  const j = await res.json().catch(()=>null) as any;
  if (!j) return { ok: false };
  // author_unique_id is the @handle (lowercase) per docs
  if (j.author_unique_id && norm(j.author_unique_id) === norm(handle)) {
    return { ok: true, method: 'oembed' };
  }
  return { ok: false };
}

async function tryProfileGET(handle: string) {
  const res = await fetch(`https://www.tiktok.com/@${encodeURIComponent(handle)}`, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    method: 'GET',
    redirect: 'follow',
    cache: 'no-store'
  });
  if (!res.ok) return { ok: false };
  const html = await res.text();
  // Look for canonical or og:url with /@handle
  const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const ogMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
  const url = (canonMatch?.[1] || ogMatch?.[1] || '').toLowerCase();
  if (url.includes('/@')) {
    const found = url.split('/@')[1].split(/[/?#]/)[0];
    if (norm(found) === norm(handle)) return { ok: true, method: 'html' };
  }
  return { ok: false };
}

export async function GET(req: NextRequest) {
  const handleRaw = (req.nextUrl.searchParams.get('handle') || '').trim();
  if (!handleRaw) return NextResponse.json({ exists: false, reason: 'empty' });
  const handle = handleRaw.replace(/^@/, '');

  try {
    // 1) oEmbed is light & structured
    const a = await tryOEmbed(handle);
    if (a.ok) return NextResponse.json({ exists: true, via: a.method });

    // 2) Fallback: full HTML fetch + canonical check
    const b = await tryProfileGET(handle);
    if (b.ok) return NextResponse.json({ exists: true, via: b.method });

    return NextResponse.json({ exists: false });
  } catch (e) {
    return NextResponse.json({ exists: false });
  }
}

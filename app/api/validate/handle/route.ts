import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function norm(h: string) {
  return h.replace(/^@/, '').trim().toLowerCase();
}

async function tryOEmbed(handle: string) {
  try {
    const url = `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${encodeURIComponent(handle)}`;
    const res = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        'accept': 'application/json,text/*;q=0.8,*/*;q=0.5'
      },
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store'
    });
    if (!res.ok) return { ok: false, via: 'oembed', status: res.status };
    const j = await res.json().catch(()=>null) as any;
    if (j?.author_unique_id && norm(j.author_unique_id) === norm(handle)) return { ok: true, via: 'oembed' };
    return { ok: false, via: 'oembed' };
  } catch (e:any) {
    return { ok: false, via: 'oembed', error: String(e) };
  }
}

function extractHandleFromHtml(html: string): string | null {
  // canonical
  const canonMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const ogMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
  let url = (canonMatch?.[1] || ogMatch?.[1] || '').toLowerCase();
  if (url.includes('/@')) {
    const found = url.split('/@')[1].split(/[/?#]/)[0];
    return found;
  }
  // Fallback: embedded SIGI_STATE json (undocumented, but usually present)
  const sigi = html.match(/<script[^>]+id=["']SIGI_STATE["'][^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (sigi) {
    try {
      const j = JSON.parse(sigi);
      const seourl = (j?.SEOState?.metaParams?.ogUrl || '').toLowerCase();
      if (seourl.includes('/@')) {
        const found = seourl.split('/@')[1].split(/[/?#]/)[0];
        return found;
      }
    } catch {}
  }
  return null;
}

async function tryGetVariants(handle: string) {
  const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
    'accept-language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  } as Record<string,string>;
  const urls = [
    `https://www.tiktok.com/@${encodeURIComponent(handle)}`,
    `https://www.tiktok.com/@${encodeURIComponent(handle)}?lang=en`,
    `https://m.tiktok.com/@${encodeURIComponent(handle)}`
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u, { headers, method: 'GET', redirect: 'follow', cache: 'no-store' });
      if (!res.ok) continue;
      const html = await res.text();
      const found = extractHandleFromHtml(html);
      if (found && norm(found) === norm(handle)) return { ok: true, via: 'html', url: u };
      // sometimes canonical shows the *new* handle after rename; accept if same user page?
      if (found) return { ok: false, via: 'html-mismatch', found };
    } catch {}
  }
  return { ok: false, via: 'html' };
}

export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get('handle') || '').trim();
  if (!raw) return NextResponse.json({ exists: false, reason: 'empty' });
  const handle = raw.replace(/^@/, '');

  const a = await tryOEmbed(handle);
  if (a.ok) return NextResponse.json({ exists: true, via: a.via });

  const b = await tryGetVariants(handle);
  if ((b as any).ok) return NextResponse.json({ exists: true, via: (b as any).via });

  return NextResponse.json({ exists: false, via: (b as any).via || a.via });
}

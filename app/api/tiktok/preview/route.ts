
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle')?.toLowerCase().trim();
  if (!handle) return NextResponse.json({ ok:false, error:"Handle fehlt" });

  const url = `https://www.tiktok.com/@${handle}`;
  try {
    const html = await fetch(url, { headers:{ "User-Agent":"Mozilla/5.0" }}).then(r=>r.text());
    const $ = cheerio.load(html);

    const avatar = $('img').first().attr('src') || null;
    const title = $('title').text().trim() || handle;
    let followers = 0;
    const stats = $('strong[data-e2e="followers-count"]').text().trim();
    if (stats) followers = parseInt(stats.replace(/\D/g,'')) || 0;

    if (!avatar) return NextResponse.json({ ok:false, error:"Profil nicht gefunden" });

    return NextResponse.json({
      ok:true,
      data:{
        avatar,
        name: title.replace("TikTok","").trim(),
        handle,
        followers
      }
    });

  } catch(e){
    return NextResponse.json({ ok:false, error:"Fehler beim Proxy" });
  }
}

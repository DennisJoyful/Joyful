
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { handle, contact, followers, plannedHours, code, mode } = body;

    if(!handle) return NextResponse.json({ error:"Handle fehlt" },{status:400});
    if(!code) return NextResponse.json({ error:"Referral Code fehlt" },{status:400});

    const sb = await supabaseServer();
    const table = mode === "sws" ? "werber" : "werber";

    const { data: ref } = await sb.from(table)
      .select('id, manager_id')
      .eq('ref_code', code)
      .maybeSingle();

    if(!ref) return NextResponse.json({ error:"Ungültiger Code" },{status:400});

    const notes = `Kontakt:${contact||"-"} | Followers:${followers||"-"} | Hours:${plannedHours||"-"}`;

    const { error } = await sb.from('leads').insert({
      creator_handle: handle.toLowerCase(),
      manager_id: ref.manager_id,
      werber_id: ref.id,
      source: mode === "sws" ? "sws_form" : "werber_form",
      notes,
      status: 'not_contacted'
    });

    if(error) return NextResponse.json({ error:error.message },{status:500});

    return NextResponse.json({ ok:true });

  } catch(e:any){
    return NextResponse.json({ error:e.message||"Serverfehler" },{status:500});
  }
}

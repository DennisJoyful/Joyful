import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function POST(req: Request){
  const { id, status } = await req.json();
  if(!id || !status) return NextResponse.json({ ok:false, error:'missing id/status' }, { status: 400 });

  // Wenn Status gesetzt wird und contact_date fehlt → heute + follow-up in 5 Tagen
  const today = new Date();
  const follow = new Date(today); follow.setDate(follow.getDate()+5);
  const payload:any = { status };
  // Hole existierenden Lead um Felder logisch zu setzen
  const { data: lead } = await supabase.from('leads').select('contact_date, follow_up_date').eq('id', id).single();
  if(!lead?.contact_date){
    payload.contact_date = today.toISOString().slice(0,10);
    payload.follow_up_date = follow.toISOString().slice(0,10);
  } else if(!lead?.follow_up_date){
    payload.follow_up_date = follow.toISOString().slice(0,10);
  }

  const { error } = await supabase.from('leads').update(payload).eq('id', id);
  if(error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true });
}

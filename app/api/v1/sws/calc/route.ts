import { NextResponse } from 'next/server';
import supabase from '@/lib/db';
import { calcAwards } from '@/lib/sws_engine';

export async function POST(req: Request){
  const { werber_id } = await req.json();
  if(!werber_id) return NextResponse.json({ ok:false, error:'werber_id required' }, { status: 400 });

  // Recruits des Werbers holen
  const { data: leads } = await supabase.from('leads').select('id, werber_id').eq('werber_id', werber_id);
  const leadIds = (leads||[]).map(l=>l.id);
  const { data: recruits } = await supabase.from('recruits').select('id, joined_date, handle, lead_id');
  const ownRecruits = (recruits||[]).filter(r=>leadIds.includes(r.lead_id));
  const recMeta = ownRecruits.map(r=>({ recruit_id: r.id, werber_id, joined_month: (r.joined_date||'').toString().slice(0,7), is_rookie: true }));

  // Stats je Recruit
  const { data: stats } = await supabase.from('stream_monthly_stats').select('recruit_id, month, days_streamed, hours_streamed, diamonds');
  const statsByRecruit: Record<string, any[]> = {};
  for(const s of stats||[]){
    (statsByRecruit[s.recruit_id] = statsByRecruit[s.recruit_id] || []).push(s);
  }

  const awards = calcAwards({ statsByRecruit, recruits: recMeta });
  // In Ledger schreiben
  const inserts = awards.map(a=>({
    werber_id: a.werber_id,
    recruit_id: a.recruit_id || null,
    points: a.points,
    reason: a.reason,
    date: new Date().toISOString().slice(0,10)
  }));
  if(inserts.length>0){
    await supabase.from('points_ledger').insert(inserts);
  }
  return NextResponse.json({ ok:true, count: inserts.length });
}

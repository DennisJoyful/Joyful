import { NextResponse } from 'next/server';
import supabase from '@/lib/db';

export async function GET(){
  // Annahme: stream_monthly_stats(recruit_id, month, days_streamed, hours_streamed, diamonds)
  // und recruits(handle, joined_date, lead_id) → leads(creator_handle, manager_id)
  // 1) letzte 30 Tage ohne Stream: hier vereinfachte Heuristik über Monatsstats (kein Tagesgranular)
  // 2) < 7 Tage ODER < 15 Stunden im Monat

  const { data: stats } = await supabase
    .from('stream_monthly_stats')
    .select('recruit_id, month, days_streamed, hours_streamed, diamonds, recruit:recruits(id, handle, lead:leads(creator_handle, manager_id))')
    .order('month', { ascending: false });

  const latestByRecruit = new Map<string, any>();
  for(const row of stats||[]){
    const key = row.recruit_id;
    if(!latestByRecruit.has(key)) latestByRecruit.set(key, row);
  }
  const inactive:any[] = [];
  const lowActivity:any[] = [];
  for(const r of latestByRecruit.values()){
    const days = r.days_streamed||0;
    const hours = r.hours_streamed||0;
    const handle = r.recruit?.handle || r.recruit?.lead?.creator_handle || '—';
    const manager = r.recruit?.lead?.manager_id || null;
    if(days===0 && hours===0){ inactive.push({ handle, manager, month: r.month }); }
    if(days < 7 || hours < 15){ lowActivity.push({ handle, manager, month: r.month, days, hours }); }
  }

  return NextResponse.json({ inactive, lowActivity });
}

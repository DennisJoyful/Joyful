export type Stat = { recruit_id:string; month:string; days_streamed:number; hours_streamed:number; diamonds:number; joined_month?:string; is_rookie?:boolean; };
export type Award = { recruit_id?:string; werber_id:string; points:number; reason:string; date?:string };
const d = (n:number)=>n;

// Regeln (vereinfacht gemäß Lastenheft)
// - Aktiv im 1. vollen Monat (>=7 Tage & >=15 Stunden): +500
// - 3 Monate in Folge ab 1. vollem Monat 7/15: +100
// - 15k Diamanten innerhalb der ersten 3 vollen Monate: +150
// - 50k Diamanten innerhalb der ersten 3 vollen Monate: +300
// - Rookie beigetreten, 150k Diamanten im Monat: (nicht genau spezifiziert → als Beispiel +300)
// - Werber: je 5 aktive Geworbene: +500 (Aggregation außerhalb pro Werber)

export function calcAwards(args:{
  statsByRecruit: Record<string, Stat[]>,
  recruits: { recruit_id:string; werber_id:string; joined_month:string; is_rookie?:boolean }[]
}): Award[]{
  const out: Award[] = [];
  const activeRecruitsByWerber: Record<string, number> = {};

  for(const rec of args.recruits){
    const list = (args.statsByRecruit[rec.recruit_id]||[]).sort((a,b)=>a.month.localeCompare(b.month));
    // 1. voller Monat = der erste Monat >= joined_month (vereinfachte Logik)
    const firstFull = list.find(s=>s.month >= rec.joined_month);
    if(!firstFull) continue;
    const first3 = list.filter(s=>s.month>=rec.joined_month).slice(0,3);

    // Aktiv im 1. vollen Monat
    if(firstFull.days_streamed>=7 && firstFull.hours_streamed>=15){
      out.push({ recruit_id: rec.recruit_id, werber_id: rec.werber_id, points: 500, reason: 'Aktiv 7/15 im 1. vollen Monat' });
      activeRecruitsByWerber[rec.werber_id] = (activeRecruitsByWerber[rec.werber_id]||0)+1;
    }

    // 3 Monate in Folge 7/15
    if(first3.length===3 && first3.every(s=>s.days_streamed>=7 && s.hours_streamed>=15)){
      out.push({ recruit_id: rec.recruit_id, werber_id: rec.werber_id, points: 100, reason: '3 Monate in Folge 7/15 ab 1. vollem Monat' });
    }

    // Diamanten innerhalb erster 3 Monate
    const totalDiamonds = first3.reduce((a,s)=>a+d(s.diamonds||0),0);
    if(totalDiamonds>=50000) out.push({ recruit_id: rec.recruit_id, werber_id: rec.werber_id, points: 300, reason: '≥50k Diamanten in 3 vollen Monaten' });
    else if(totalDiamonds>=15000) out.push({ recruit_id: rec.recruit_id, werber_id: rec.werber_id, points: 150, reason: '≥15k Diamanten in 3 vollen Monaten' });

    // Rookie 150k im Monat
    if(rec.is_rookie){
      const any150k = list.some(s=>s.diamonds>=150000);
      if(any150k) out.push({ recruit_id: rec.recruit_id, werber_id: rec.werber_id, points: 300, reason: 'Rookie: 150k Diamanten in einem Monat' });
    }
  }

  // Werberbonus je 5 aktive
  for(const [werber, count] of Object.entries(activeRecruitsByWerber)){
    const bonus = Math.floor(count/5) * 500;
    if(bonus>0) out.push({ werber_id: werber, points: bonus, reason: `Werberbonus: je 5 aktive (${count})` });
  }

  return out;
}

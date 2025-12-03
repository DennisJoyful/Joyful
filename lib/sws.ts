// lib/sws.ts
export type MonthlyStat = {
  joined_date: string; // ISO
  month: string;       // YYYY-MM
  days_streamed: number;
  hours_streamed: number;
  diamonds: number;
  is_rookie?: boolean;
};
export type PointsEvent = { date: string; points: number; reason: string; ref?: string };
export type Recruit = { handle: string; joined_date: string; stats: MonthlyStat[] };

// Conditions from Lastenheft (vereinfachte Demo-Logik)
export function calcPointsForRecruit(r: Recruit): PointsEvent[] {
  const events: PointsEvent[] = [];
  const firstFullMonth = getFirstFullMonth(r.joined_date);
  if (!firstFullMonth) return events;

  const first3 = monthRange(firstFullMonth, 3);
  const firstMonth = r.stats.find(s => s.month === firstFullMonth);
  if (firstMonth && s715(firstMonth)) {
    events.push({ date: isoFromMonth(firstMonth.month), points: 500, reason: "Recruit aktiv 7/15 im 1. vollen Monat", ref: r.handle });
  }
  // 3 Monate in Folge 7/15
  const streak = consecutive715(r.stats.filter(s => first3.includes(s.month)).sort((a,b)=>a.month.localeCompare(b.month)));
  if (streak >= 3) {
    events.push({ date: isoFromMonth(first3[2]), points: 100, reason: "Recruit 7/15 drei Monate in Folge", ref: r.handle });
  }
  // Diamanten milestones innerhalb 3 voller Monate
  const in3 = r.stats.filter(s => first3.includes(s.month));
  const maxDiamonds = Math.max(0, ...in3.map(s => s.diamonds));
  if (maxDiamonds >= 50000) {
    events.push({ date: isoFromMonth(first3[0]), points: 300, reason: "Recruit 50k Diamanten ≤3 Monate", ref: r.handle });
  } else if (maxDiamonds >= 15000) {
    events.push({ date: isoFromMonth(first3[0]), points: 150, reason: "Recruit 15k Diamanten ≤3 Monate", ref: r.handle });
  }
  // Rookie 150k im Monat
  if (in3.some(s => (s.is_rookie && s.diamonds >= 150000))) {
    events.push({ date: isoFromMonth(in3[0]?.month || firstFullMonth), points: 0, reason: "Rookie 150k Diamanten (Info-Event)", ref: r.handle });
  }
  return events;
}

export function s715(s: MonthlyStat) { return (s.days_streamed >= 7 && s.hours_streamed >= 15); }
export function consecutive715(arr: MonthlyStat[]) {
  let streak = 0, best = 0;
  for (const s of arr) {
    if (s715(s)) { streak++; best = Math.max(best, streak); } else { streak = 0; }
  }
  return best;
}
export function getFirstFullMonth(joinedISO: string): string | null {
  const d = new Date(joinedISO);
  if (isNaN(d.getTime())) return null;
  // next month (full month after join)
  const m = d.getUTCMonth() + 1;
  const y = d.getUTCFullYear() + (m === 12 ? 1 : 0);
  const nm = (m === 12 ? 1 : m + 1);
  return `${y}-${String(nm).padStart(2,'0')}`;
}
export function monthRange(startYYYYMM: string, n: number): string[] {
  const [y0,m0] = startYYYYMM.split('-').map(Number);
  const arr: string[] = [];
  for (let i=0;i<n;i++) {
    const y = y0 + Math.floor((m0-1+i)/12);
    const m = ((m0-1+i)%12)+1;
    arr.push(`${y}-${String(m).padStart(2,'0')}`);
  }
  return arr;
}
export function isoFromMonth(yyyyMM: string) { return `${yyyyMM}-01`; }

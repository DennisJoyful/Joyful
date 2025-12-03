// lib/sws_points.ts
export type LedgerItem = { id: string; date: string; points: number; reason: string; recruit_handle?: string };
export function sumPoints(items: LedgerItem[]) {
  return items.reduce((acc, x) => acc + (x.points || 0), 0);
}

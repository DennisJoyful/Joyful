export type Row = Record<string, any>;

function norm(s: any): string {
  return String(s ?? '').trim();
}

export function parseDurationToHours(val: any): number {
  const s = norm(val);
  if (!s) return 0;
  // Try HH:MM:SS or HH:MM
  const hms = s.match(/^\s*(\d{1,3})(?::(\d{1,2}))?(?::(\d{1,2}))?\s*$/);
  if (hms) {
    const h = parseInt(hms[1] ?? '0', 10);
    const m = parseInt(hms[2] ?? '0', 10);
    const sec = parseInt(hms[3] ?? '0', 10);
    return h + (m/60) + (sec/3600);
  }
  // Try minutes as number
  const num = Number(s.replace(',', '.'));
  if (!Number.isNaN(num)) {
    // If seems too large for hours but fits minutes, guess minutes
    if (num > 300 && num < 50000) return num / 60;
    return num; // already hours
  }
  return 0;
}

export function parseMonthToISO(val: any): string | null {
  const s = norm(val);
  if (!s) return null;
  // Expect either YYYY-MM or YYYY-MM-01 or date-like string
  // Normalize to YYYY-MM-01
  // Simple cases:
  const m1 = s.match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?$/);
  if (m1) {
    const y = m1[1];
    const m = m1[2].padStart(2, '0');
    return `${y}-${m}-01`;
  }
  // "Nov 2025" etc.
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec',
                  'januar','februar','märz','april','mai','juni','juli','august','september','oktober','november','dezember'];
  const idx = months.findIndex(x => s.toLowerCase().includes(x));
  if (idx >= 0) {
    const y = (s.match(/\d{4}/) || [null])[0];
    let mm = ((idx % 12) + 1).toString().padStart(2, '0');
    if (y) return `${y}-${mm}-01`;
  }
  // Fallback: Date parse
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-01`;
  }
  return null;
}

export function pick(obj: Row, keys: string[]): any[] {
  return keys.map(k => obj[k]);
}

// German header helpers
export function getVal(obj: Row, candidates: string[]): any {
  for (const c of candidates) {
    const key = Object.keys(obj).find(k => k.trim().toLowerCase() === c.trim().toLowerCase());
    if (key) return obj[key];
  }
  // loose contains match
  for (const c of candidates) {
    const key = Object.keys(obj).find(k => k.toLowerCase().includes(c.toLowerCase()));
    if (key) return obj[key];
  }
  return null;
}

'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { loadRules } from '@/lib/sws/rules';

type AwardResult = { created: number; skipped_duplicate: number; errors: number };

export async function awardSWSPointsForMonth(monthISO: string): Promise<AwardResult> {
  const sb = await supabaseServer();
  const rules = await loadRules();

  const { data: recruits, error: rErr } = await sb
    .from('recruits')
    .select('id, creator_id, joined_date, lead_id, handle');
  if (rErr) throw rErr;

  let created = 0, dup = 0, errors = 0;

  for (const rec of (recruits ?? [])) {
    const creator_id = rec.creator_id;
    if (!creator_id) continue;

    let werber_id: string | null = null;

    if (rec.lead_id) {
      const lead = await sb.from('leads').select('werber_id').eq('id', rec.lead_id).maybeSingle();
      if (!lead.error && lead.data?.werber_id) werber_id = lead.data.werber_id;
    }
    if (!werber_id) {
      const st = await sb.from('streamer').select('assigned_werber_id').eq('creator_id', creator_id).maybeSingle();
      if (!st.error && st.data?.assigned_werber_id) werber_id = st.data.assigned_werber_id;
    }
    if (!werber_id) continue;

    const joined = rec.joined_date ? new Date(rec.joined_date) : null;
    if (!joined) continue;
    const firstFullMonth = new Date(Date.UTC(joined.getUTCFullYear(), joined.getUTCMonth() + 1, 1));
    const curMonth = new Date(monthISO);
    if (curMonth < firstFullMonth) continue;

    const { data: metric } = await sb
      .from('v_streamer_monthly')
      .select('days_streamed, hours_streamed, diamonds, month, rookie')
      .eq('creator_id', creator_id)
      .eq('month', curMonth.toISOString().slice(0,10))
      .maybeSingle();
    if (!metric) continue;

    const isActive = (metric.days_streamed ?? 0) >= 7 && (Number(metric.hours_streamed) ?? 0) >= 15;

    async function credit(reason: string, points: number) {
      const res = await sb.from('points_ledger').insert({
        werber_id,
        creator_id,
        month: curMonth.toISOString().slice(0,10),
        points,
        reason,
        date: curMonth.toISOString().slice(0,10)
      });
      if (res.error) {
        if ((res.error.code ?? '').includes('23505') || (res.error.message ?? '').toLowerCase().includes('duplicate')) {
          dup++;
        } else {
          errors++;
        }
      } else {
        created++;
      }
    }

    if (isActive) {
      const joinedFull = new Date(Date.UTC(joined.getUTCFullYear(), joined.getUTCMonth() + 1, 1));
      if (curMonth.getTime() === joinedFull.getTime()) {
        await credit('first_full_month_7_15', rules['bonus_first_full_month_7_15']);
      }
    }

    const m1 = new Date(Date.UTC(joined.getUTCFullYear(), joined.getUTCMonth() + 1, 1));
    const m2 = new Date(Date.UTC(joined.getUTCFullYear(), joined.getUTCMonth() + 2, 1));
    const m3 = new Date(Date.UTC(joined.getUTCFullYear(), joined.getUTCMonth() + 3, 1));
    const inFirst3 = [m1.getTime(), m2.getTime(), m3.getTime()].includes(curMonth.getTime());
    if (inFirst3) {
      if ((metric.diamonds ?? 0) >= 50000) {
        await credit('diamonds_50k_first_3m', rules['bonus_50k_diamonds_first_3m']);
      } else if ((metric.diamonds ?? 0) >= 15000) {
        await credit('diamonds_15k_first_3m', rules['bonus_15k_diamonds_first_3m']);
      }
    }

    if (metric.rookie && (metric.diamonds ?? 0) >= 150000) {
      const pts = (rules as any)['bonus_rookie_150k'] ?? 0;
      if (pts > 0) await credit('rookie_150k', pts);
    }
  }

  return { created, skipped_duplicate: dup, errors };
}

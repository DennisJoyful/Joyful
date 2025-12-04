import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { loadRules } from '@/lib/sws/rules';
import { getProfile } from '@/lib/auth/getProfile';

function firstFullMonth(joinDateStr: string): string | null {
  const d = new Date(joinDateStr);
  if (isNaN(d.getTime())) return null;
  const firstOfJoin = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  // first full month is next month
  const m = new Date(Date.UTC(firstOfJoin.getUTCFullYear(), firstOfJoin.getUTCMonth()+1, 1));
  return `${m.getUTCFullYear()}-${String(m.getUTCMonth()+1).padStart(2,'0')}-01`;
}

function addMonths(isoMonth: string, add: number): string {
  const [y,m] = isoMonth.split('-').map(Number);
  const d = new Date(Date.UTC(y, m-1+add, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-01`;
}

export async function POST(req: NextRequest) {
  const { user, profile } = await getProfile();
  if (!user || profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json();
  const month = body.month as string; // YYYY-MM-01 bassismonat für Prüfung in 3 Monaten
  const commit = !!body.commit;
  if (!month) return NextResponse.json({ error: 'month required (YYYY-MM-01)' }, { status: 400 });

  const sb = await supabaseServer();
  const rules = await loadRules();

  // Load streamer with join_date and assigned_werber_id/profile
  const { data: streamers } = await sb.from('streamer').select('creator_id, join_date, assigned_werber_id, creator_handle');
  const { data: ttm } = await sb.from('tiktok_monthly').select('creator_id, month, days_streamed, hours_streamed, diamonds, rookie');

  // Map month data
  const monthlyByCreator: Record<string, any[]> = {};
  for (const r of (ttm ?? [])) {
    (monthlyByCreator[r.creator_id] ||= []).push(r);
  }

  // Map profile->werber via links
  const { data: wlinks } = await sb.from('werber_links').select('profile_id, werber_id');
  const profileToWerber = Object.fromEntries((wlinks ?? []).map(w => [w.profile_id, w.werber_id])) as Record<string,string>;

  const awards: any[] = [];
  const problems: any[] = [];

  for (const s of (streamers ?? [])) {
    const join = s.join_date;
    if (!join) continue;
    const m1 = firstFullMonth(join);
    if (!m1) continue;
    const months = [m1, addMonths(m1,1), addMonths(m1,2)];

    // gather M1..M3 rows
    const rows = (monthlyByCreator[s.creator_id] ?? []).filter(r => months.includes(r.month));

    const has715M1 = !!rows.find(r => r.month===m1 && r.days_streamed>=7 && Number(r.hours_streamed)>=15);
    if (has715M1 && rules.first_month_active_7_15>0) {
      awards.push({
        reason: 'first_month_active_7_15',
        points: rules.first_month_active_7_15,
        creator_id: s.creator_id,
        month: m1,
        dedupe_key: `M1-7/15:${s.creator_id}:${m1}`
      });
    }

    const mcount715 = rows.filter(r => r.days_streamed>=7 && Number(r.hours_streamed)>=15).length;
    if (mcount715>=3 && rules.three_months_7_15>0) {
      awards.push({
        reason: 'three_months_7_15',
        points: rules.three_months_7_15,
        creator_id: s.creator_id,
        month: m1,
        dedupe_key: `3mo-7/15:${s.creator_id}:${m1}`
      });
    }

    const sumDiamondsM1to3 = rows.reduce((s2,r)=> s2 + Number(r.diamonds ?? 0), 0);
    if (sumDiamondsM1to3>=50000 && rules['50k_diamonds_in_3_months']>0) {
      awards.push({ reason:'50k_diamonds_in_3_months', points: rules['50k_diamonds_in_3_months'], creator_id: s.creator_id, month: m1, dedupe_key:`50k:${s.creator_id}:${m1}`});
    } else if (sumDiamondsM1to3>=15000 && rules['15k_diamonds_in_3_months']>0) {
      awards.push({ reason:'15k_diamonds_in_3_months', points: rules['15k_diamonds_in_3_months'], creator_id: s.creator_id, month: m1, dedupe_key:`15k:${s.creator_id}:${m1}`});
    }

    // Rookie 150k in any of M1..M3 months
    const rookieHit = rows.find(r => r.rookie && Number(r.diamonds)>=150000);
    if (rookieHit && rules.rookie_150k_in_month>0) {
      awards.push({ reason:'rookie_150k_in_month', points: rules.rookie_150k_in_month, creator_id: s.creator_id, month: rookieHit.month, dedupe_key:`rookie150k:${s.creator_id}:${rookieHit.month}`});
    }
  }

  // Resolve werber IDs for each award from assigned_werber_id (profile) via mapping
  const enriched = awards.map(a => {
    const streamer = (streamers ?? []).find(x => x.creator_id===a.creator_id);
    const profileWerber = streamer?.assigned_werber_id as string | null;
    const werberId = profileWerber ? profileToWerber[profileWerber] : null;
    if (!werberId) problems.push({ ...a, issue: 'missing_werber_mapping' });
    return { ...a, werber_id: werberId };
  });

  // per 5 active recruits for each werber within months window (count unique creators with 7/15 in M1..M3)
  const activeByWerber: Record<string, Set<string>> = {};
  for (const s of (streamers ?? [])) {
    const profileWerber = s.assigned_werber_id as string | null;
    const werberId = profileWerber ? profileToWerber[profileWerber] : null;
    if (!werberId) continue;
    const join = s.join_date; if (!join) continue;
    const m1 = firstFullMonth(join); if (!m1) continue;
    const months = [m1, addMonths(m1,1), addMonths(m1,2)];
    const rows = (monthlyByCreator[s.creator_id] ?? []).filter(r => months.includes(r.month));
    const hit = rows.find(r => r.days_streamed>=7 && Number(r.hours_streamed)>=15);
    if (hit) {
      (activeByWerber[werberId] ||= new Set()).add(s.creator_id);
    }
  }

  for (const [werberId, creators] of Object.entries(activeByWerber)) {
    const n = creators.size;
    const bundles = Math.floor(n / 5);
    if (bundles>0 && rules.per_5_active_recruits>0) {
      enriched.push({
        reason: 'per_5_active_recruits',
        points: rules.per_5_active_recruits * bundles,
        creator_id: null,
        month,
        werber_id: werberId,
        dedupe_key: `per5:${werberId}:${month}`
      });
    }
  }

  // Dedupe vs existing points_ledger
  const dedupeKeys = enriched.map(e => e.dedupe_key).filter(Boolean);
  let existing: any[] = [];
  if (dedupeKeys.length) {
    const { data } = await sb.from('points_ledger').select('id, reason, meta').in('reason', ['first_month_active_7_15','three_months_7_15','15k_diamonds_in_3_months','50k_diamonds_in_3_months','rookie_150k_in_month','per_5_active_recruits']).order('id');
    existing = (data ?? []).filter(row => row.meta && row.meta.dedupe_key);
  }
  const existsSet = new Set(existing.map(x => x.meta.dedupe_key));
  const toInsert = enriched.filter(e => e.werber_id && !existsSet.has(e.dedupe_key));

  if (!commit) {
    return NextResponse.json({ preview: enriched, toInsertCount: toInsert.length, problems });
  }

  for (const e of toInsert) {
    await sb.from('points_ledger').insert({
      werber_id: e.werber_id,
      creator_id: e.creator_id,
      month: e.month,
      points: e.points,
      reason: e.reason,
      meta: { dedupe_key: e.dedupe_key },
      date: e.month
    });
  }

  return NextResponse.json({ ok: true, inserted: toInsert.length, skipped: enriched.length - toInsert.length, problems });
}

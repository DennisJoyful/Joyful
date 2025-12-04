import { supabaseServer } from '@/lib/supabase/server';

export type RuleSet = Record<string, number>;

const DEFAULTS: RuleSet = {
  bonus_first_full_month_7_15: 500,
  bonus_three_consecutive_7_15: 100,
  bonus_15k_diamonds_first_3m: 150,
  bonus_50k_diamonds_first_3m: 300,
  bonus_per_5_active_recruits: 500
};

export async function loadRules(): Promise<RuleSet> {
  const sb = supabaseServer();
  const admin = await sb.from('admin_settings').select('reward_rules').eq('id', 1).maybeSingle();
  let rules: RuleSet | null = null;
  if (admin.data?.reward_rules && typeof admin.data.reward_rules === 'object') {
    rules = admin.data.reward_rules as RuleSet;
  }
  if (!rules) {
    const rr = await sb.from('reward_rules').select('key, points');
    if (!rr.error && rr.data) {
      rules = rr.data.reduce((acc: RuleSet, r: any) => { acc[r.key] = r.points; return acc; }, {} as RuleSet);
    }
  }
  return { ...DEFAULTS, ...(rules ?? {}) };
}

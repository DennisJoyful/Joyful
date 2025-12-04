import { supabaseServer } from '@/lib/supabase/server';

export type Rules = {
  first_month_active_7_15: number;
  three_months_7_15: number;
  '15k_diamonds_in_3_months': number;
  '50k_diamonds_in_3_months': number;
  rookie_150k_in_month: number;
  per_5_active_recruits: number;
};

export async function loadRules(): Promise<Rules> {
  const sb = await supabaseServer();
  const { data } = await sb.from('reward_rules').select('key, points');
  const map: any = Object.fromEntries((data ?? []).map((r:any)=> [r.key, r.points]));
  return {
    first_month_active_7_15: map['first_month_active_7_15'] ?? 500,
    three_months_7_15: map['three_months_7_15'] ?? 100,
    '15k_diamonds_in_3_months': map['15k_diamonds_in_3_months'] ?? 150,
    '50k_diamonds_in_3_months': map['50k_diamonds_in_3_months'] ?? 300,
    rookie_150k_in_month: map['rookie_150k_in_month'] ?? 0,
    per_5_active_recruits: map['per_5_active_recruits'] ?? 500,
  };
}

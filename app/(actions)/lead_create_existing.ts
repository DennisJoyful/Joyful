'use server';

import { supabaseServer } from '@/lib/supabase/server';

type LeadStatus =
  | 'not_contacted'
  | 'invited'
  | 'declined'
  | 'joined'
  | 'no_response';

export async function createLeadExisting(input: {
  creator_handle: string;
  creator_id?: string;
  source: string; // must match existing enum in DB
  contact_date?: string; // YYYY-MM-DD
  status?: LeadStatus;
  notes?: string;
  werber_id?: string; // uuid
}) {
  const sb = await supabaseServer();
  const { data: { user }, error: userErr } = await sb.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error('Not authenticated');

  const { data: prof, error: pErr } = await sb
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();
  if (pErr) throw pErr;

  const payload: any = {
    creator_handle: input.creator_handle.trim(),
    creator_id: input.creator_id ?? null,
    source: input.source,
    manager_id: prof?.id,
    created_by: prof?.id,
    status: input.status ?? 'not_contacted',
    contact_date: input.contact_date ?? null,
    notes: input.notes ?? null,
    werber_id: input.werber_id ?? null
  };

  const { error } = await sb.from('leads').insert(payload);
  if (error) throw error;
  return { ok: true };
}

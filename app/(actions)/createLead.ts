'use server';

import { supabaseServer } from '@/lib/supabase/server';

export async function createLead(input: {
  creator_handle: string;
  creator_id?: string;
  quelle: string;
  kontaktdatum?: string; // YYYY-MM-DD
  status?: 'keine_reaktion' | 'eingeladen' | 'abgesagt' | 'gejoint';
  notes?: string;
}) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const payload = {
    manager_user_id: user.id,
    creator_handle: input.creator_handle.trim(),
    creator_id: input.creator_id ?? null,
    quelle: input.quelle,
    kontaktdatum: input.kontaktdatum ?? null,
    status: input.status ?? 'keine_reaktion',
    notes: input.notes ?? null
  };

  const { error } = await sb.from('leads').insert(payload);
  if (error) throw error;
  return { ok: true };
}

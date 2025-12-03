// lib/followup.ts (erweitert)
export type LeadStatus = 'keine reaktion' | 'eingeladen' | 'abgesagt' | 'gejoint' | 'aktiv' | 'inaktiv' | 'followup';
export type Lead = {
  id: string;
  creator_handle: string;
  status: LeadStatus;
  source?: string;
  contact_date?: string | null; // ISO date
  follow_up_date?: string | null; // ISO date
  live_status?: boolean;
};
export function computeFollowUp(contactISO?: string | null): string | null {
  if (!contactISO) return null;
  const d = new Date(contactISO);
  if (isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + 5);
  return d.toISOString().slice(0, 10);
}
export function withAutoFollowUp(lead: Lead): Lead {
  const fud = lead.follow_up_date ?? computeFollowUp(lead.contact_date);
  return { ...lead, follow_up_date: fud };
}

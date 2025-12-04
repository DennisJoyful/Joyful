import { supabaseServer } from '@/lib/supabase/server';
import { KPI } from '@/components/KPI';
import { requireManager } from '@/lib/auth/guards';

export default async function ManagerDashboardPage() {
  const guarded = await requireManager(<ManagerDashboardInner />);
  return guarded;
}

async function ManagerDashboardInner() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const { data: leads } = await sb.from('leads').select('id, status').eq('manager_id', user?.id);
  const { data: myStreamers } = await sb.from('streamer').select('creator_id').eq('assigned_manager_id', user?.id);

  const totalLeads = (leads ?? []).length;
  const contacted = (leads ?? []).filter(l => l.status !== 'not_contacted').length;
  const streamerCount = (myStreamers ?? []).length;

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-3 gap-4">
        <KPI label="Meine Leads" value={totalLeads} />
        <KPI label="Kontaktiert" value={contacted} />
        <KPI label="Meine Streamer" value={streamerCount} />
      </div>
      <div className="card">Willkommen in deinem Manager-Dashboard.</div>
    </div>
  );
}

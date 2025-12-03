import KPI from '@/components/KPI';

async function getMetrics(){
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const res = await fetch(`${base}/api/admin/metrics`, { cache: 'no-store' });
  if(!res.ok) return { byStatus:{}, byManager:{} };
  return res.json();
}

export default async function AdminDashboard(){
  const { byStatus, byManager } = await getMetrics();
  const totalLeads = Object.values(byStatus||{}).reduce((a:any,b:any)=>a+(b as number),0);
  const totalManager = Object.keys(byManager||{}).length;
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Leads gesamt" value={totalLeads as any} />
        <KPI label="Manager aktiv" value={totalManager as any} />
        <KPI label="Eingeladen" value={(byStatus?.['eingeladen']||0) as any} />
        <KPI label="Follow-up" value={(byStatus?.['followup']||0) as any} />
      </div>
    </main>
  );
}

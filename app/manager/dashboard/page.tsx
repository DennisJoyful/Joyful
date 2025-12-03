import KPI from '@/components/KPI';

async function getMetrics(){
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const res = await fetch(`${base}/api/admin/metrics`, { cache: 'no-store' });
  if(!res.ok) return { byStatus:{}, byManager:{} };
  return res.json();
}

export default async function ManagerDashboard(){
  const { byStatus } = await getMetrics();
  const total = Object.values(byStatus||{}).reduce((a:any,b:any)=>a+(b as number),0);
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Leads gesamt" value={total as any} />
        <KPI label="Eingeladen" value={(byStatus?.['eingeladen']||0) as any} />
        <KPI label="Gejoint" value={(byStatus?.['gejoint']||0) as any} />
        <KPI label="Aktiv" value={(byStatus?.['aktiv']||0) as any} />
      </div>
      <div className="space-x-3">
        <a className="underline" href="/manager/leads-pro">Leads verwalten</a>
        <a className="underline" href="/manager/inaktive2">Inaktive prüfen</a>
        <a className="underline" href="/manager/werber">Werber Übersicht</a>
      </div>
    </main>
  );
}

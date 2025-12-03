async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/metrics`, { cache: 'no-store' });
  if (!res.ok) return { byStatus: {}, byManager: {} };
  return res.json();
}
export default async function AdminOverview() {
  const { byStatus, byManager } = await getData();
  const s = Object.entries(byStatus);
  const m = Object.entries(byManager);
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin – Übersicht</h1>
      <section>
        <h2 className="font-semibold mb-2">Leads nach Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {s.length===0 && <div className="text-gray-500">Keine Daten</div>}
          {s.map(([k,v]) => (
            <div key={k} className="rounded-lg ring-1 ring-gray-200 p-3">
              <div className="text-sm text-gray-500">{k}</div>
              <div className="text-2xl font-bold">{v as any}</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-semibold mb-2">Leads pro Manager</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {m.length===0 && <div className="text-gray-500">Keine Daten</div>}
          {m.map(([k,v]) => (
            <div key={k} className="rounded-lg ring-1 ring-gray-200 p-3">
              <div className="text-sm text-gray-500">Manager</div>
              <div className="text-xs text-gray-400 break-all">{k}</div>
              <div className="text-2xl font-bold mt-1">{v as any}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

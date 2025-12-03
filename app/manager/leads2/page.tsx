import LeadTable from '@/components/LeadTable';

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/mock/leads`, { cache: 'no-store' });
  if (!res.ok) return [];
  return (await res.json())?.rows || [];
}

export default async function Leads2Page() {
  const rows = await getData();

  async function update(id: string, data: any) {
    'use server';
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/mock/leads`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, data }),
    });
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leads (mit Auto-Follow-up)</h1>
        <a href="/manager/leads" className="text-sm underline">zur alten Ansicht</a>
      </div>
      <p className="text-gray-600 text-sm">Diese Ansicht berechnet <strong>Follow-up-Daten (+5 Tage)</strong> automatisch, bietet <strong>Filter</strong> und zeigt Live-Status. Buttons schreiben aktuell in eine Mock-API.</p>
      <LeadTable rows={rows} onAction={update} />
    </main>
  );
}

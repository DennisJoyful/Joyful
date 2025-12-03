import LeadTable from '@/components/LeadTable';
import { USE_SUPABASE, BASE } from '@/lib/config';

async function getData() {
  const path = USE_SUPABASE ? '/api/v1/leads' : '/api/mock/leads';
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return (await res.json())?.rows || [];
}

export default async function Leads2Page() {
  const rows = await getData();

  async function update(id: string, data: any) {
    'use server';
    const path = USE_SUPABASE ? '/api/v1/leads' : '/api/mock/leads';
    await fetch(`${BASE}${path}`, {
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
      <p className="text-gray-600 text-sm">
        Diese Ansicht berechnet <strong>Follow-up-Daten (+5 Tage)</strong> automatisch, bietet <strong>Filter</strong> und zeigt Live-Status.
        Datenquelle: <code>{USE_SUPABASE ? 'Supabase (v1)' : 'Mock-API'}</code>.
      </p>
      {/* Server Action (Demo) */}
      <LeadTable rows={rows} onAction={update} />
    </main>
  );
}

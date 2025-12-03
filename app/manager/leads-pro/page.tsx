import StatusWorkflow from '@/components/StatusWorkflow';

async function getRows(){
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const res = await fetch(`${base}/api/v1/leads`, { cache: 'no-store' });
  if(!res.ok) return [];
  const json = await res.json();
  return json?.rows || [];
}

export default async function LeadsPro(){
  const rows = await getRows();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Leads – Pro</h1>
      <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Handle</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Kontakt</th>
              <th className="px-3 py-2">Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r:any)=>(
              <tr key={r.id} className="border-t align-top">
                <td className="px-3 py-2 font-medium">@{r.creator_handle}</td>
                <td className="px-3 py-2"><StatusWorkflow id={r.id} status={r.status}/></td>
                <td className="px-3 py-2">{r.source}</td>
                <td className="px-3 py-2">{r.contact_date ?? '—'}</td>
                <td className="px-3 py-2">{r.follow_up_date ?? '—'}</td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="px-3 py-8 text-center text-gray-500" colSpan={5}>Keine Daten</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400">Hinweis: Diese Ansicht lädt ohne SWR. Nach Status-Änderungen bitte Seite neu laden.</p>
    </main>
  );
}

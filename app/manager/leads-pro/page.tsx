'use client';
import useSWR from 'swr';
import StatusWorkflow from '@/components/StatusWorkflow';
const fetcher = (url:string)=>fetch(url).then(r=>r.json());

export default function LeadsPro(){
  const { data, mutate } = useSWR('/api/v1/leads', fetcher);
  const rows = data?.rows||[];
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
    </main>
  );
}

import { USE_SUPABASE, BASE } from '@/lib/config';

async function getData() {
  const path = USE_SUPABASE ? '/api/v1/werber' : '/api/mock/werber';
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return (await res.json())?.rows || [];
}

export default async function WerberOverview() {
  const rows = await getData();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Werber-Übersicht</h1>
      <p className="text-gray-600 text-sm">
        Punktestand, Ref-Link und Geworbene je Werber ({USE_SUPABASE ? 'Supabase' : 'Mock'}).
      </p>
      <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Werber</th>
              <th className="px-3 py-2">Punkte</th>
              <th className="px-3 py-2">Ref-Link</th>
              <th className="px-3 py-2">Geworbene</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-medium">{r.name}</td>
                <td className="px-3 py-2">{r.points}</td>
                <td className="px-3 py-2"><a className="underline" href={r.ref}>Link</a></td>
                <td className="px-3 py-2">{r.count}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="px-3 py-8 text-center text-gray-500" colSpan={4}>Keine Werber gefunden</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

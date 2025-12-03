// app/werber/self/page.tsx
import { sumPoints } from '@/lib/sws_points';

async function getData() {
  const id = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_TEST_WERBER_ID : undefined;
  const qs = id ? `?id=${id}` : '';
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/werber/ledger${qs}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return (await res.json())?.rows || [];
}

export default async function WerberSelf() {
  const items = await getData();
  const total = sumPoints(items);
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mein Punkte-Konto</h1>
      <div className="rounded-xl ring-1 ring-gray-200 p-4 flex items-center justify-between">
        <div className="text-gray-600 text-sm">Aktueller Punktestand</div>
        <div className="text-3xl font-bold">{total}</div>
      </div>

      <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Punkte</th>
              <th className="px-3 py-2">Grund</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.date}</td>
                <td className="px-3 py-2">{r.points}</td>
                <td className="px-3 py-2">{r.reason}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="px-3 py-8 text-center text-gray-500" colSpan={3}>Noch keine Buchungen</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Hinweis: Für die Demo kannst du <code>NEXT_PUBLIC_TEST_WERBER_ID</code> setzen, um Daten zu laden.</p>
    </main>
  );
}

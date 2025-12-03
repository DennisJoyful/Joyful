export default async function Inaktive2() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/mock/inaktive`, { cache: 'no-store' });
  const rows = res.ok ? (await res.json()).rows : [];
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Inaktive Streamer (Demo)</h1>
      <p className="text-gray-600 text-sm">Zeigt Streamer mit ≥1 Woche ohne Stream sowie <em>7 Tage / 15 Stunden</em>-Schwellen. Später durch TikTok-Import ersetzen.</p>
      <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Creator</th>
              <th className="px-3 py-2">Wochen in Folge inaktiv</th>
              <th className="px-3 py-2">Monate <span className="whitespace-nowrap">unter 7/15</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-medium">@{r.handle}</td>
                <td className="px-3 py-2">{r.inactive_weeks}</td>
                <td className="px-3 py-2">{r.under_7_15_months}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="px-3 py-8 text-center text-gray-500" colSpan={3}>Keine Daten</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

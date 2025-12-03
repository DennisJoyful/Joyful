async function getData(id:string){
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const [points, ledger] = await Promise.all([
    fetch(`${base}/rest/v1/v_werber_points?select=werber_id,total_points&id=eq.${id}`, { cache: 'no-store' })
      .then(r=>r.json()).catch(()=>[]),
    fetch(`${base}/api/werber/ledger?id=${id}`, { cache: 'no-store' })
      .then(r=>r.json()).catch(()=>({rows:[]}))
  ]);
  const total = points?.[0]?.total_points ?? 0;
  return { total, ledger: ledger.rows||[] };
}

export default async function WerberOverview({ searchParams }:{ searchParams: { id?: string }}){
  const id = searchParams?.id || '';
  const { total, ledger } = id ? await getData(id) : { total: 0, ledger: []};
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Werber – Übersicht</h1>
      {!id && <div className="text-gray-500">Bitte mit ?id=&lt;WERBER_ID&gt; aufrufen.</div>}
      {id && (
        <>
          <div className="rounded-xl ring-1 ring-gray-200 p-4">
            <div className="text-sm text-gray-500">Aktuelle Punkte</div>
            <div className="text-3xl font-bold">{total}</div>
          </div>
          <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr><th className="px-3 py-2">Datum</th><th className="px-3 py-2">Punkte</th><th className="px-3 py-2">Grund</th></tr>
              </thead>
              <tbody>
                {ledger.map((r:any)=>(
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.date}</td>
                    <td className="px-3 py-2">{r.points}</td>
                    <td className="px-3 py-2">{r.reason}</td>
                  </tr>
                ))}
                {ledger.length===0 && <tr><td className="px-3 py-8 text-center text-gray-500" colSpan={3}>Keine Buchungen</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}

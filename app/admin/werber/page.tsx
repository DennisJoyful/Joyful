async function getData() {
  const [w, p, c] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/v1/werber`, { cache: 'no-store' }).then(r=>r.json()),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/rest/v1/v_werber_points?select=werber_id,total_points`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>[]),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/rest/v1/v_werber_recruits?select=werber_id,recruit_count`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>[]),
  ]);
  const rows = (w.rows || []).map((x:any) => ({
    ...x,
    points: (p.find((y:any)=>y.werber_id===x.id)?.total_points) ?? 0,
    count: (c.find((y:any)=>y.werber_id===x.id)?.recruit_count) ?? 0,
  }));
  return rows;
}
export default async function AdminWerber() {
  const rows = await getData();
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin – Werber</h1>
      <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Werber</th>
              <th className="px-3 py-2">Punkte</th>
              <th className="px-3 py-2">Geworbene</th>
              <th className="px-3 py-2">Ref-Link</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r:any) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-medium">{r.name}</td>
                <td className="px-3 py-2">{r.points}</td>
                <td className="px-3 py-2">{r.count}</td>
                <td className="px-3 py-2"><a className="underline" href={r.ref}>Link</a></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="px-3 py-8 text-center text-gray-500" colSpan={4}>Keine Daten</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

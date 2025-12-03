import { getServiceClient } from "@/lib/serverSupabase"

async function getData(code: string) {
  const supa = getServiceClient()
  const { data: rec } = await supa.from('recruiters')
    .select('id, display_name, tiktok_handle')
    .eq('public_code', code).single()
  if (!rec) return null
  const { data: pts } = await supa
    .from('points_ledger')
    .select('points, reason, created_at, creator_id, month')
    .eq('recruiter_id', rec.id)
    .order('created_at', { ascending: false })
  const total = (pts||[]).reduce((s,r)=>s+(r.points||0),0)
  return { rec, pts: pts||[], total }
}

export default async function WerberPublic(
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const data = await getData(code)
  if (!data) return <p>Code ungültig.</p>
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Punkte – {data.rec.display_name} (@{data.rec.tiktok_handle})</h1>
      <p>Gesamt: <b>{data.total}</b> Punkte</p>
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 px-2">Datum</th>
              <th className="px-2">Grund</th>
              <th className="px-2">Punkte</th>
            </tr>
          </thead>
          <tbody>
            {data.pts.map((r:any, i:number)=> (
              <tr key={i} className="border-b">
                <td className="py-1 px-2">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-2">{r.reason}</td>
                <td className="px-2">{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

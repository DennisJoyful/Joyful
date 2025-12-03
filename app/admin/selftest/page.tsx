export default async function AdminSelftestPage() {
  const hasToken = !!process.env.ADMIN_API_TOKEN
  const len = (process.env.ADMIN_API_TOKEN || '').length
  const site = process.env.SITE_URL || ''
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Admin Selftest</h1>
      <ul className="list-disc pl-5 text-sm">
        <li>hasToken: <b>{String(hasToken)}</b></li>
        <li>len: <b>{len}</b></li>
        <li>site: <code>{site}</code></li>
      </ul>
    </div>
  )
}

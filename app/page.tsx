export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">TikTok Live Agentur – Dashboard</h1>
      <ul className="list-disc pl-5">
        <li><a className="underline" href="/manager/leads">Manager · Leads</a></li>
        <li><a className="underline" href="/werber/dashboard">Werber · Punkte</a></li>
        <li><a className="underline" href="/admin/dashboard">Admin</a></li>
      </ul>
    </div>
  );
}

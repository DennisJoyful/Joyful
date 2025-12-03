export default function DevLinks() {
  const links = [
    ['/manager/dashboard', 'Manager – Dashboard'],
    ['/manager/leads-pro', 'Manager – Leads Pro'],
    ['/manager/inaktive2', 'Manager – Inaktive (alt)'],
    ['/admin/dashboard', 'Admin – Dashboard'],
    ['/admin/werber', 'Admin – Werber'],
    ['/werber/overview?id=', 'Werber – Übersicht (?id=...)'],
    ['/apply/manager?ref=Demo%20Manager', 'Apply – Manager (ref=Name)'],
    ['/apply/sws?ref=werbA', 'Apply – SWS (ref=Code)']
  ];
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dev-Links (Testübersicht)</h1>
      <ul className="list-disc pl-6 space-y-2">
        {links.map(([href, label]) => (
          <li key={href}><a className="underline" href={href}>{label}</a></li>
        ))}
      </ul>
    </main>
  );
}

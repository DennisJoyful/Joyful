import Link from 'next/link';
import { getProfile } from '@/lib/auth/getProfile';

const adminLinks = [
  { href: '/console/admin/dashboard', label: 'Dashboard' },
  { href: '/console/admin/leads', label: 'Leads (alle)' },
  { href: '/console/admin/agents', label: 'Agent→Manager Mapping' },
  { href: '/console/admin/discord', label: 'Discord Aktionen' },
  { href: '/console/admin/reports', label: 'Reports' },
  { href: '/admin/import', label: 'Import (tiktok_monthly)' },
  { href: '/admin/import/creator-data', label: 'Import Creator_innendaten' },
  { href: '/admin/import/creator-manage', label: 'Import Creator_innen verwalten' },
  { href: '/console/admin/sws/manual', label: 'SWS – Manuell' }
];

const managerLinks = [
  { href: '/console/manager/dashboard', label: 'Dashboard' },
  { href: '/console/manager/leads', label: 'Leads' },
  { href: '/console/manager/inactivity', label: 'Inaktivität' },
  { href: '/console/manager/sws', label: 'SWS' }
];

export default async function NavSidebar() {
  const { user, profile } = await getProfile();
  const role = profile?.role ?? 'guest';
  const links = role === 'admin' ? adminLinks : role === 'manager' ? managerLinks : [];

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="card">
        <div className="font-semibold">Menü</div>
        <div className="text-xs text-gray-500">Rolle: {role}</div>
        <ul className="mt-3 grid gap-1">
          {links.map(l => (
            <li key={l.href}>
              <Link className="underline" href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

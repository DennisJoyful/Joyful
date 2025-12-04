import NavSidebar from '@/components/NavSidebar';

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-6 grid md:grid-cols-[16rem_1fr] gap-6">
      <NavSidebar />
      <main>{children}</main>
    </div>
  );
}

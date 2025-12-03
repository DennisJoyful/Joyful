
import './globals.css'
import Link from 'next/link'

export const metadata = { title: 'TikTok Live Agentur' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex gap-4 text-sm">
            <Link href="/manager/leads" className="hover:underline">Manager · Leads</Link>
            <Link href="/manager/inaktive" className="hover:underline">Manager · Inaktive</Link>
            <Link href="/manager/sws" className="hover:underline">Manager · SWS</Link>
            <Link href="/werber/dashboard" className="hover:underline">Werber</Link>
            <Link href="/admin/dashboard" className="hover:underline">Admin</Link>
            <Link href="/admin/import" className="hover:underline">Import</Link>
            <Link href="/auth/sign-in" className="ml-auto hover:underline">Login</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  )
}

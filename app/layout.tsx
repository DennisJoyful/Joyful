import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Joyful Admin",
  description: "TikTok Live Agentur Verwaltung"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <div className="container py-6">{children}</div>
      </body>
    </html>
  );
}

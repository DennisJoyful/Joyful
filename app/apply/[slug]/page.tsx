import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ApplyPage({ params }: { params: { slug: string } }) {
  // TODO: lookup slug -> owner, kind
  // For now, render a simple form
  return (
    <div className="card max-w-xl mx-auto">
      <h1 className="h1">Bewerbung</h1>
      <p className="mt-2">Referral: {params.slug}</p>
      <form className="mt-6 grid gap-3">
        <label className="grid gap-1">
          <span>Creator Handle</span>
          <input name="handle" className="border rounded-xl px-3 py-2" placeholder="@deinhandle" />
        </label>
        <label className="grid gap-1">
          <span>Kontakt (optional)</span>
          <input name="contact" className="border rounded-xl px-3 py-2" placeholder="Discord/Telegram" />
        </label>
        <button className="btn mt-2">Absenden</button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Nach Absenden wird ein Lead angelegt (Leadquelle=manager_form/werber_form).
      </p>
      <Link className="underline mt-4 inline-block" href="/">Zurück</Link>
    </div>
  );
}

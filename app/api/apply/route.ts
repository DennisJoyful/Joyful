
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { handle, code, contact, followers, plannedHours } = body;

    if (!handle) {
      return NextResponse.json({ error: "Handle fehlt." }, { status: 400 });
    }

    const sb = await supabaseServer();

    const { data: ref } = await sb
      .from("werber")
      .select("id, manager_id")
      .eq("ref_code", code)
      .maybeSingle();

    if (!ref) {
      return NextResponse.json({ error: "Ungültiger Referral-Code." }, { status: 400 });
    }

    const notes = [
      `Kontakt: ${contact}`,
      followers ? `Follower: ${followers}` : "",
      plannedHours ? `PlannedHours: ${plannedHours}` : "",
    ].filter(Boolean).join(" | ");

    const { error } = await sb.from("leads").insert({
      creator_handle: handle.toLowerCase(),
      source: "werber_form",
      manager_id: ref.manager_id,
      werber_id: ref.id,
      notes,
      status: "not_contacted"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}

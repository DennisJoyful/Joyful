// app/api/tiktok/preview/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Falls du Payload brauchst:
  // const data = await req.json();

  return NextResponse.json(
    { ok: true, message: "tiktok/preview ready" },
    { status: 200 }
  );
}

// Optional zusätzlich:
export async function GET(_req: NextRequest) {
  return NextResponse.json({ ok: true }, { status: 200 });
}

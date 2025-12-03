import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  console.log('Mock apply received', body);
  // Hier später: in Supabase speichern
  return NextResponse.json({ ok: true });
}

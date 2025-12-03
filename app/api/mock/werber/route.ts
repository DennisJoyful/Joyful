// app/api/mock/werber/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const rows = [
    { id: 'w1', name: 'Werber A', points: 1250, ref: '/apply?ref=werber-a', count: 7 },
    { id: 'w2', name: 'Werber B', points: 980, ref: '/apply?ref=werber-b', count: 5 },
  ];
  return NextResponse.json({ rows });
}

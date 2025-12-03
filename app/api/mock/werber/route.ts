import { NextResponse } from 'next/server';

export async function GET() {
  const rows = [
    { id: 'w1', name: 'Werber A', points: 1250, ref: '/apply/sws?ref=werbA', count: 7 },
    { id: 'w2', name: 'Werber B', points: 980, ref: '/apply/sws?ref=werbB', count: 5 },
  ];
  return NextResponse.json({ rows });
}

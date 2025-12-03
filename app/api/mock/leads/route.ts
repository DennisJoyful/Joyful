import { NextResponse } from 'next/server';

let rows = [
  { id: '1', creator_handle: 'alice', status: 'eingeladen', source: 'SWS', contact_date: '2025-12-01', live_status: true },
  { id: '2', creator_handle: 'bob', status: 'keine reaktion', source: 'Admin', contact_date: '2025-11-30', live_status: false },
  { id: '3', creator_handle: 'carla', status: 'gejoint', source: 'Manager', contact_date: '2025-11-28', follow_up_date: '2025-12-03', live_status: false },
];

export async function GET() { return NextResponse.json({ rows }); }
export async function POST(req: Request) {
  const { id, data } = await req.json();
  rows = rows.map(r => r.id === id ? { ...r, ...data } : r);
  return NextResponse.json({ ok: true });
}

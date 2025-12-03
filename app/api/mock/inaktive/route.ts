import { NextResponse } from 'next/server';

export async function GET() {
  const rows = [
    { id: 'i1', handle: 'alice', inactive_weeks: 2, under_7_15_months: 1 },
    { id: 'i2', handle: 'bob', inactive_weeks: 5, under_7_15_months: 2 },
  ];
  return NextResponse.json({ rows });
}

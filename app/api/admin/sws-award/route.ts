import { NextRequest, NextResponse } from 'next/server';
import { awardSWSPointsForMonth } from '@/app/(actions)/sws_award';

export async function POST(req: NextRequest) {
  try {
    const { month } = await req.json();
    if (!month) return NextResponse.json({ error: 'month required' }, { status: 400 });
    const res = await awardSWSPointsForMonth(month);
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

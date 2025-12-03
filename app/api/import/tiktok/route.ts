import { NextResponse } from 'next/server';
export async function POST(req: Request){
  // Stub: nimmt JSON { month: 'YYYY-MM', rows: [...] } entgegen und antwortet nur mit count
  try{
    const body = await req.json();
    const count = Array.isArray(body?.rows) ? body.rows.length : 0;
    return NextResponse.json({ ok:true, month: body?.month, received: count });
  }catch(e:any){
    return NextResponse.json({ ok:false, error: e?.message||'invalid payload' }, { status: 400 });
  }
}

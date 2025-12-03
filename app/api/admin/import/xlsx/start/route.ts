
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest){
  try {
    const body = await req.json().catch(()=>null)
    const b64 = body?.b64 as string
    if (!b64) return NextResponse.json({ ok:false, error:'missing b64' }, { status:400 })

    const { default: XLSX } = await import('xlsx')
    const buf = Buffer.from(b64, 'base64')
    const wb = XLSX.read(buf, { type: 'buffer' })
    const sheets = wb.SheetNames
    const ws = wb.Sheets[sheets[0]]
    const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]
    const headers = (json[0]||[]).map((h:any)=> String(h))
    const token = Buffer.from(JSON.stringify({ b64, sheets })).toString('base64')
    return NextResponse.json({ ok:true, headers, sheets, token })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'xlsx parse failed' }, { status:500 })
  }
}

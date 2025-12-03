
export function parseCSV(text: string): { headers: string[], rows: string[][] } {
  const lines = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').filter(l=>l.length>0)
  if (lines.length === 0) return { headers: [], rows: [] }
  const sep = ',' // simple CSV (TikTok export bitte als CSV speichern)
  const parseLine = (line: string) => {
    const out: string[] = []
    let cur = '', inQ = false
    for (let i=0;i<line.length;i++) {
      const ch = line[i]
      if (ch === '"') { inQ = !inQ; continue }
      if (!inQ && ch === sep) { out.push(cur); cur=''; continue }
      cur += ch
    }
    out.push(cur)
    return out.map(s=>s.trim())
  }
  const headers = parseLine(lines[0])
  const rows = lines.slice(1).map(parseLine)
  return { headers, rows }
}

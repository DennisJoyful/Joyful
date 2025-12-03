
export function LiveDot({ live }: { live: 'not_checked'|'onair'|'offline' }) {
  const color = live === 'onair' ? 'bg-green-500' : live === 'offline' ? 'bg-gray-400' : 'bg-slate-300'
  const label = live === 'onair' ? 'ON AIR' : live === 'offline' ? 'offline' : 'nicht geprüft'
  return <span className="inline-flex items-center gap-1 text-xs"><span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />{label}</span>
}

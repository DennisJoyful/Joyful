import React from 'react';

type Props = {
  status: string;
  className?: string;
};

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; ring: string }> = {
  'keine reaktion': { label: 'Keine Reaktion', bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-gray-200' },
  'eingeladen': { label: 'Eingeladen', bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-200' },
  'abgesagt': { label: 'Abgesagt', bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-200' },
  'gejoint': { label: 'Gejoint', bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-200' },
  'aktiv': { label: 'Aktiv', bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-200' },
  'inaktiv': { label: 'Inaktiv', bg: 'bg-zinc-100', text: 'text-zinc-800', ring: 'ring-zinc-200' },
  'followup': { label: 'Follow-up', bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-200' },
};

export default function StatusBadge({ status, className }: Props) {
  const s = STATUS_MAP[status?.toLowerCase?.()] || { label: status || 'Unbekannt', bg: 'bg-gray-100', text: 'text-gray-800', ring: 'ring-gray-200' };
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
        s.bg, s.text, s.ring, className
      ].filter(Boolean).join(' ')}
    >
      {s.label}
    </span>
  );
}

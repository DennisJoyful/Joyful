'use client';
import React, { useMemo, useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import LiveDot from '@/components/LiveDot';
import FiltersBar, { Filters } from '@/components/FiltersBar';
import { withAutoFollowUp, type Lead } from '@/lib/followup';

export default function LeadTable({ rows, onAction } : { rows: Lead[]; onAction?: (id:string, data:Partial<Lead>)=>void }) {
  const [filters, setFilters] = useState<Filters>({});
  const sources = useMemo(() => Array.from(new Set(rows.map(r => r.source).filter(Boolean))) as string[], [rows]);

  const filtered = useMemo(() => {
    const needle = (filters.search ?? '').toLowerCase();
    return rows
      .map(withAutoFollowUp)
      .filter(r => !filters.status || r.status === filters.status)
      .filter(r => !filters.source || r.source === filters.source)
      .filter(r => !needle || (r.creator_handle?.toLowerCase?.().includes(needle)));
  }, [rows, filters]);

  return (
    <div className="w-full">
      <FiltersBar filters={filters} onChange={setFilters} sources={sources} />
      <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Creator</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Live</th>
              <th className="px-3 py-2">Kontakt</th>
              <th className="px-3 py-2">Follow-up</th>
              <th className="px-3 py-2 w-40">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-medium">@{r.creator_handle}</td>
                <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-2"><LiveDot live={!!r.live_status} /></td>
                <td className="px-3 py-2">{r.contact_date ?? '—'}</td>
                <td className="px-3 py-2">{r.follow_up_date ?? '—'}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => onAction?.(r.id, { status: 'eingeladen' as any, contact_date: new Date().toISOString().slice(0,10) })}
                    className="px-2 py-1 rounded border text-xs"
                  >
                    eingeladen
                  </button>
                  <button
                    onClick={() => onAction?.(r.id, { status: 'keine reaktion' as any })}
                    className="ml-2 px-2 py-1 rounded border text-xs"
                  >
                    keine reaktion
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="px-3 py-8 text-center text-gray-500" colSpan={6}>Keine Leads gefunden</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

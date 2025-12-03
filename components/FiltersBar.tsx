// components/FiltersBar.tsx
'use client';
import React from 'react';

export type Filters = { status?: string; source?: string; search?: string; };
export default function FiltersBar({ filters, onChange, sources = [] } : {
  filters: Filters; onChange: (f: Filters) => void; sources?: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <input
        placeholder="Suche @handle..."
        value={filters.search ?? ''}
        onChange={e => onChange({ ...filters, search: e.target.value })}
        className="border rounded-lg px-3 py-2 text-sm"
      />
      <select
        value={filters.status ?? ''}
        onChange={e => onChange({ ...filters, status: e.target.value || undefined })}
        className="border rounded-lg px-3 py-2 text-sm"
      >
        <option value="">Status (alle)</option>
        <option>keine reaktion</option>
        <option>eingeladen</option>
        <option>abgesagt</option>
        <option>gejoint</option>
        <option>aktiv</option>
        <option>inaktiv</option>
        <option>followup</option>
      </select>
      <select
        value={filters.source ?? ''}
        onChange={e => onChange({ ...filters, source: e.target.value || undefined })}
        className="border rounded-lg px-3 py-2 text-sm"
      >
        <option value="">Quelle (alle)</option>
        {sources.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}

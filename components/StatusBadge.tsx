<<<<<<< ours

import clsx from 'clsx'
export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    not_contacted: 'bg-gray-200 text-gray-800',
    no_response: 'bg-amber-200 text-amber-900',
    invited: 'bg-blue-200 text-blue-900',
    rejected: 'bg-red-200 text-red-900',
    joined: 'bg-green-200 text-green-900',
  }
  return <span className={clsx('px-2 py-1 rounded text-xs font-medium', map[status] || 'bg-gray-200')}>{status}</span>
}
=======
import React from 'react';
>>>>>>> theirs

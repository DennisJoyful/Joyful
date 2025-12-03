import React from 'react';

export default function LiveDot({ isLive = false, className = '' }: { isLive?: boolean; className?: string }) {
  const color = isLive ? 'bg-red-500' : 'bg-gray-300';
  const ring = isLive ? 'ring-red-300' : 'ring-gray-200';
  const pulse = isLive ? 'animate-pulse' : '';
  return (
    <span
      className={['inline-block h-2.5 w-2.5 rounded-full', color, ring, 'ring-2', pulse, className].join(' ')}
      title={isLive ? 'Live' : 'Offline'}
    />
  );
}

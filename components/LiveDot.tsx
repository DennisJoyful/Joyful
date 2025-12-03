import React from 'react';

export type LiveDotProps = { isLive?: boolean; className?: string };

const LiveDot: React.FC<LiveDotProps> = ({ isLive = false, className = '' }) => {
  const color = isLive ? 'bg-red-500' : 'bg-gray-300';
  const ring = isLive ? 'ring-red-300' : 'ring-gray-200';
  const pulse = isLive ? 'animate-pulse' : '';
  return (
    <span
      className={['inline-block h-2.5 w-2.5 rounded-full', color, ring, 'ring-2', pulse, className].join(' ')}
      title={isLive ? 'Live' : 'Offline'}
    />
  );
};

export default LiveDot;
// Support both default and named import styles:
export { LiveDot };

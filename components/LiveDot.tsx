import React from 'react';

export type LiveDotProps = { isLive?: boolean; live?: boolean; className?: string };

const LiveDot: React.FC<LiveDotProps> = ({ isLive, live, className = '' }) => {
  const effective = (typeof live === 'boolean' ? live : (isLive ?? false));
  const color = effective ? 'bg-red-500' : 'bg-gray-300';
  const ring = effective ? 'ring-red-300' : 'ring-gray-200';
  const pulse = effective ? 'animate-pulse' : '';
  return (
    <span
      className={['inline-block h-2.5 w-2.5 rounded-full', color, ring, 'ring-2', pulse, className].join(' ')}
      title={effective ? 'Live' : 'Offline'}
    />
  );
};

export default LiveDot;
export { LiveDot };

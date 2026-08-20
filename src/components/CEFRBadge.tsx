import React from 'react';
import { CefrLevel } from '../types';

interface CEFRBadgeProps {
  level: CefrLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const CEFRBadge: React.FC<CEFRBadgeProps> = ({ level, size = 'md', showLabel = false }) => {
  const getColors = () => {
    switch (level) {
      case 'A1':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'A2':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-800';
      case 'B1':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'B2':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'C1':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'C2':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-extrabold tracking-wide',
    lg: 'text-sm px-3 py-1.5 font-extrabold tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border shadow-xs transition-colors whitespace-nowrap ${getColors()} ${sizeClasses[size]}`}
    >
      <span>{level}</span>
      {showLabel && <span className="opacity-75 text-[10px] font-normal uppercase">CEFR</span>}
    </span>
  );
};

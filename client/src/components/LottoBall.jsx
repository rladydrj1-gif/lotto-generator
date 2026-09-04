import React from 'react';
import { getBallColorInfo } from '../utils/lotto';

export default function LottoBall({ number, size = 'md', isFixed = false, isExcluded = false, className = '' }) {
  const colorInfo = getBallColorInfo(number);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs font-bold shadow-xs',
    md: 'w-9 h-9 sm:w-10 sm:h-10 text-sm sm:text-base font-bold shadow-sm',
    lg: 'w-11 h-11 sm:w-12 sm:h-12 text-base sm:text-lg font-extrabold shadow-md',
    xl: 'w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl font-black shadow-lg',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full text-white select-none transition-transform duration-200 transform hover:scale-105 ${sizeClasses[size] || sizeClasses.md} ${className}`}
      style={{
        backgroundColor: colorInfo.bg,
        boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.25), inset 2px 2px 4px rgba(255,255,255,0.4), 0 3px 6px rgba(0,0,0,0.15)`
      }}
    >
      <span>{number}</span>
      {isFixed && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] px-1 py-0.2 rounded-full font-bold shadow">
          고정
        </span>
      )}
      {isExcluded && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] px-1 py-0.2 rounded-full font-bold shadow">
          제외
        </span>
      )}
    </div>
  );
}

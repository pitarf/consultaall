'use client';

import React, { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: string;
}

export const Tooltip = ({ children, text }: TooltipProps) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-[11px] leading-snug rounded-lg whitespace-normal w-48 shadow-2xl border border-white/10 transition-all duration-200 z-50 text-center pointer-events-none">
        {text}
        {/* Seta do balão */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
};

'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  // Bloqueia o scroll do corpo quando o drawer estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop (Fundo escurecido) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Painel Lateral */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[600px] lg:w-[800px] bg-slate-50 dark:bg-[#020617] shadow-2xl z-[101] transform transition-transform duration-500 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f172a]">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Snapshot da consulta realizada</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50 dark:bg-[#020617]">
          {children}
        </div>
      </div>
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, LogOut, Database } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';

interface MobileSidebarProps {
  isAdmin: boolean;
  whatsappLink: string;
  logoUrl?: string;
}

export function MobileSidebar({ isAdmin, whatsappLink, logoUrl }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const drawerContent = isOpen ? (
    <div className="fixed inset-0 z-[100] flex">
      {/* Overlay Escuro */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Conteúdo */}
      <div className="relative w-72 h-full bg-[#0f172a] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-7 w-auto object-contain" />
            ) : (
              <Database className="text-primary w-5 h-5" />
            )}
            <span className="text-lg font-bold tracking-tight text-white">
              Detetive<span className="text-primary">Buscas</span>
            </span>
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Quando clica em um link, fecha o menu */}
          <div onClick={() => setIsOpen(false)}>
            <SidebarNav isAdmin={isAdmin} whatsappLink={whatsappLink} />
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-3 px-3 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="md:hidden">
      {/* Botão Hambúrguer */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Renderiza o Drawer no body se estiver montado */}
      {mounted && createPortal(drawerContent, document.body)}
    </div>
  );
}

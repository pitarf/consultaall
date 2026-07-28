'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';

interface NavbarClientProps {
  logoUrl?: string | null;
  siteTitle?: string | null;
  menuPages?: Array<{ title: string; slug: string }>;
}

export default function NavbarClient({ logoUrl, siteTitle, menuPages = [] }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Função para retornar o link correto dependendo se o usuário está na Home ou não
  const getHref = (hash: string) => {
    return pathname === '/' ? hash : `/${hash}`;
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="h-8 w-auto object-contain"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#2872fa] flex items-center justify-center shadow-md shadow-[#2872fa]/20 group-hover:scale-105 transition-transform">
              <Search className="w-4.5 h-4.5 text-white" />
            </div>
          )}
          <span className="text-lg font-bold tracking-tight text-[#243b56]">
            Detetive<span className="text-[#2872fa]">Buscas</span>
          </span>
        </Link>

        {/* Links de navegação desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href={getHref('#recursos')} className="text-sm font-semibold text-slate-600 hover:text-[#2872fa] transition-colors">
            Recursos
          </Link>
          <Link href={getHref('#como-funciona')} className="text-sm font-semibold text-slate-600 hover:text-[#2872fa] transition-colors">
            Como Funciona
          </Link>
          <Link href={getHref('#precos')} className="text-sm font-semibold text-slate-600 hover:text-[#2872fa] transition-colors">
            Preços
          </Link>
          <Link href={getHref('#aplicacoes')} className="text-sm font-semibold text-slate-600 hover:text-[#2872fa] transition-colors">
            Aplicações
          </Link>
          <Link href={getHref('#faq')} className="text-sm font-semibold text-slate-600 hover:text-[#2872fa] transition-colors">
            FAQ
          </Link>
          <Link href="/blog" className="text-sm font-bold text-slate-600 hover:text-[#2872fa] transition-colors">
            Blog
          </Link>
          {menuPages.map((page) => (
            <Link 
              key={page.slug} 
              href={`/${page.slug}`} 
              className="text-sm font-semibold text-slate-600 hover:text-[#2872fa] transition-colors"
            >
              {page.title.split(' - ')[0]}
            </Link>
          ))}
        </nav>

        {/* Ações desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-bold text-slate-700 hover:text-[#2872fa] px-4 py-2 rounded-xl transition-colors"
          >
            Entrar
          </Link>
          <Link 
            href="/cadastro" 
            className="text-sm font-bold text-white bg-[#2872fa] hover:bg-[#1a5ecd] px-5 py-2.5 rounded-xl shadow-md shadow-[#2872fa]/10 transition-all active:scale-95"
          >
            Acessar Plataforma
          </Link>
        </div>

        {/* Botão Hambúrguer Mobile */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-600 hover:text-[#243b56] focus:outline-none p-1.5"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu retrátil mobile (Posicionado de forma absoluta para sobrepor o conteúdo e com sombra de destaque) */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl overflow-hidden transition-all duration-300 ease-in-out z-50 ${
          isOpen ? 'max-h-[500px] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-3">
          <Link
            href={getHref('#recursos')}
            onClick={() => setIsOpen(false)}
            className="block text-base font-semibold text-slate-600 hover:text-[#2872fa] py-2"
          >
            Recursos
          </Link>
          <Link
            href={getHref('#como-funciona')}
            onClick={() => setIsOpen(false)}
            className="block text-base font-semibold text-slate-600 hover:text-[#2872fa] py-2"
          >
            Como Funciona
          </Link>
          <Link
            href={getHref('#precos')}
            onClick={() => setIsOpen(false)}
            className="block text-base font-semibold text-slate-600 hover:text-[#2872fa] py-2"
          >
            Preços
          </Link>
          <Link
            href={getHref('#aplicacoes')}
            onClick={() => setIsOpen(false)}
            className="block text-base font-semibold text-slate-600 hover:text-[#2872fa] py-2"
          >
            Aplicações
          </Link>
          <Link
            href={getHref('#faq')}
            onClick={() => setIsOpen(false)}
            className="block text-base font-semibold text-slate-600 hover:text-[#2872fa] py-2"
          >
            FAQ
          </Link>
          <Link
            href="/blog"
            onClick={() => setIsOpen(false)}
            className="block text-base font-bold text-slate-600 hover:text-[#2872fa] py-2"
          >
            Blog
          </Link>
          {menuPages.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              onClick={() => setIsOpen(false)}
              className="block text-base font-semibold text-slate-600 hover:text-[#2872fa] py-2"
            >
              {page.title.split(' - ')[0]}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Link
              href="/login"
              className="text-center font-bold text-slate-700 hover:text-[#2872fa] py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-center font-bold text-white bg-[#2872fa] hover:bg-[#1a5ecd] py-2.5 rounded-xl shadow-md transition-colors"
            >
              Acessar Plataforma
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

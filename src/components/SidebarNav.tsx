'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Building2, 
  Scale, 
  MapPin, 
  History, 
  Package, 
  UserCircle, 
  LifeBuoy, 
  Code,
  ShieldCheck,
  Globe,
  FileText,
  BookOpen,
  Settings,
  Gift,
  Award
} from 'lucide-react';

interface SidebarNavProps {
  isAdmin?: boolean;
  isSeo?: boolean;
  role?: string;
  whatsappLink: string;
}

export function SidebarNav({ isAdmin, isSeo, role, whatsappLink }: SidebarNavProps) {
  const pathname = usePathname();

  // Função para verificar se o link está ativo
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path !== '/dashboard' && pathname.startsWith(path)) return true;
    return false;
  };

  const navItemClass = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
      active 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;
  };

  return (
    <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
      <Link href="/dashboard" className={navItemClass('/dashboard')}>
        <LayoutDashboard className="w-4 h-4" />
        <span className="text-sm">Painel</span>
      </Link>
      
      <Link href="/dashboard" className={navItemClass('/dashboard')}>
        <Users className="w-4 h-4" />
        <span className="text-sm">Consultar pessoas</span>
      </Link>

      <Link href="/dashboard/veiculos" className={navItemClass('/dashboard/veiculos')}>
        <Car className="w-4 h-4" />
        <span className="text-sm">Consultar veículos</span>
      </Link>

      <Link href="/dashboard/empresas" className={navItemClass('/dashboard/empresas')}>
        <Building2 className="w-4 h-4" />
        <span className="text-sm">Consultar empresas</span>
      </Link>

      <div title="Em desenvolvimento" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 cursor-not-allowed opacity-50 transition-colors">
        <Scale className="w-4 h-4" />
        <span className="text-sm">Consultar processos</span>
      </div>

      <div title="Em desenvolvimento" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 cursor-not-allowed opacity-50 transition-colors">
        <MapPin className="w-4 h-4" />
        <span className="text-sm">Consultar endereços</span>
      </div>

      <Link href="/dashboard/historico" className={`${navItemClass('/dashboard/historico')} mt-4`}>
        <History className="w-4 h-4" />
        <span className="text-sm">Minhas consultas</span>
      </Link>

      <Link href="/dashboard/faturas" className={navItemClass('/dashboard/faturas')}>
        <Package className="w-4 h-4" />
        <span className="text-sm">Adicionar Saldo</span>
      </Link>

      <Link href="/dashboard/promocoes" className={navItemClass('/dashboard/promocoes')}>
        <Gift className="w-4 h-4" />
        <span className="text-sm">Promoções</span>
      </Link>

      <Link href="/dashboard/indicacoes" className={navItemClass('/dashboard/indicacoes')}>
        <Award className="w-4 h-4" />
        <span className="text-sm">Indique e Ganhe</span>
      </Link>

      <Link href="/dashboard/perfil" className={navItemClass('/dashboard/perfil')}>
        <UserCircle className="w-4 h-4" />
        <span className="text-sm">Perfil</span>
      </Link>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <LifeBuoy className="w-4 h-4" />
        <span className="text-sm">Suporte</span>
      </a>

      <div title="Em desenvolvimento" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 cursor-not-allowed opacity-50 transition-colors">
        <Code className="w-4 h-4" />
        <span className="text-sm">API</span>
      </div>

      {(isAdmin || role === 'ADMIN') && (
        <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/5 border border-red-500/10 transition-colors mt-2">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm font-bold">Painel Admin</span>
        </Link>
      )}

      {(isSeo || role === 'SEO') && (
        <div className="pt-3 mt-3 border-t border-white/5 space-y-1">
          <div className="px-3 py-1 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-bold tracking-wider text-blue-400 uppercase">Gestão de SEO</span>
          </div>
          
          <Link href="/admin/paginas" className={navItemClass('/admin/paginas')}>
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Páginas SEO</span>
          </Link>

          <Link href="/admin/blog" className={navItemClass('/admin/blog')}>
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Blog CMS</span>
          </Link>

          <Link href="/admin/configuracoes" className={navItemClass('/admin/configuracoes')}>
            <Settings className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Configurações SEO</span>
          </Link>
        </div>
      )}
    </nav>
  );
}

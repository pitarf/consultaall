import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Users, Activity, LogOut, ArrowLeft, Settings, DollarSign, Tag } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AdminMobileMenu } from '@/components/AdminMobileMenu';
import { cookies } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAdminVerified = cookieStore.get('admin_verified')?.value === 'true';
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard'); // Redireciona usuários normais para fora do admin
  }

  // Checkpoint de segurança secundária
  if (!isAdminVerified) {
    redirect('/admin-login');
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Admin - Mantida estaticamente em tom escuro de contraste para visual SaaS premium */}
      <aside className="w-64 border-r border-red-500/20 bg-[#0f172a] hidden md:flex flex-col relative overflow-hidden">
        {/* Efeito Glow vermelho sutil indicando privilégios administrativos */}
        <div className="absolute top-0 left-0 w-full h-32 bg-red-500/10 blur-3xl -z-10"></div>

        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <ShieldCheck className="text-red-500 w-6 h-6 mr-2" />
          <span className="text-lg font-bold text-white">Admin<span className="text-red-500">Panel</span></span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Métricas Geral
          </Link>
          <Link href="/admin/usuarios" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Users className="w-5 h-5" />
            Gestão de Usuários
          </Link>
          <Link href="/admin/vendas" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <DollarSign className="w-5 h-5" />
            Vendas e Receita
          </Link>
          <Link href="/admin/precos" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Tag className="w-5 h-5" />
            Tabela de Preços
          </Link>
          <Link href="/admin/configuracoes" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5" />
            Configurações
          </Link>
          <Link href="/admin/logs" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Activity className="w-5 h-5" />
            Logs de Sistema
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/dashboard" className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao App
          </Link>
        </div>
      </aside>

      {/* Main Content - Fundo dinâmico adaptável ao tema claro ou escuro */}
      <div className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-background">
        {/* Header superior adaptativo unificado com ThemeToggle */}
        <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-card/30 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shadow-sm sticky top-0 z-50 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <AdminMobileMenu />
            <ShieldCheck className="text-red-500 w-5 h-5 hidden xs:inline" />
            <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm md:text-base">Painel Administrativo</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Alternador dinâmico de tema Clean / Dark */}
            <ThemeToggle />
            
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voltar ao App</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}

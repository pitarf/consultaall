import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Users, Activity, LogOut, ArrowLeft, Settings, DollarSign, Tag } from 'lucide-react';
import Link from 'next/link';

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
      {/* Sidebar Admin */}
      <aside className="w-64 border-r border-red-500/20 bg-card/50 hidden md:flex flex-col relative overflow-hidden">
        {/* Glow effect indicando área restrita */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-white/10 bg-card/30 flex items-center justify-between px-4 md:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-red-500 w-5 h-5" />
            <span className="font-bold text-white">Admin</span>
          </div>
          <Link href="/dashboard" className="text-gray-400"><ArrowLeft className="w-5 h-5" /></Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import {
  Database,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { logout } from '@/app/actions/auth';
import { BalanceHeader } from '@/components/BalanceHeader';
import { SidebarNav } from '@/components/SidebarNav';
import { MobileSidebar } from '@/components/MobileSidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, balance: true, role: true },
  });

  const settings = await prisma.systemSetting.findFirst();
  const whatsappNumber = (settings?.supportWhatsapp || "5511999999999").replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Ol%C3%A1%2C%20gostaria%20de%20suporte%20no%20DetetiveBuscas`;

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Inspirado na referência DeskData */}
      <aside className="w-64 border-r border-white/10 bg-[#0f172a] hidden md:flex flex-col">
        <div className="h-20 flex items-center justify-center border-b border-white/5 p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="h-8 w-auto object-contain"
              />
            ) : (
              <Database className="text-primary w-6 h-6" />
            )}
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Detetive<span className="text-primary">Buscas</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <SidebarNav isAdmin={user.role === 'ADMIN'} whatsappLink={whatsappLink} />

          <div className="px-3 pb-4">
            <form action={logout}>
              <button type="submit" className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-background">
        <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-card/30 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shadow-sm sticky top-0 z-50">
          <MobileSidebar 
            isAdmin={user.role === 'ADMIN'} 
            whatsappLink={whatsappLink} 
            logoUrl={settings?.logoUrl} 
          />
          
          <Suspense fallback={<div className="h-8 w-32 bg-white/5 animate-pulse rounded-2xl" />}>
            <BalanceHeader initialBalance={user.balance} />
          </Suspense>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

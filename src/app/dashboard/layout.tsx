import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { 
  Database, 
  LayoutDashboard, 
  Users, 
  Building2, 
  Scale, 
  Car, 
  MapPin, 
  History, 
  Package, 
  UserCircle, 
  LifeBuoy, 
  Code, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { logout } from '@/app/actions/auth';
import { BalanceHeader } from '@/components/BalanceHeader';

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
    select: { name: true, email: true, balance: true, role: true },
  });

  const settings = await prisma.systemSetting.findFirst();
  const whatsappNumber = (settings?.supportWhatsapp || "5511999999999").replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Ol%C3%A1%2C%20gostaria%20de%20suporte%20no%20ConsultaALL`;
  
  console.log(`📞 Link de Suporte Gerado: ${whatsappLink}`);

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
              {settings?.siteTitle?.split(' - ')[0] || "Consulta"}<span className="text-primary">{settings?.siteTitle?.split(' - ')[1] || "ALL"}</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm">Painel</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium">
            <Users className="w-4 h-4" />
            <span className="text-sm">Consultar pessoas</span>
          </Link>
          <div 
            title="Em desenvolvimento"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 cursor-not-allowed opacity-50 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            <span className="text-sm">Consultar empresas</span>
          </div>
          <div 
            title="Em desenvolvimento"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 cursor-not-allowed opacity-50 transition-colors"
          >
            <Scale className="w-4 h-4" />
            <span className="text-sm">Consultar processos</span>
          </div>
          <Link href="/dashboard/veiculos" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Car className="w-4 h-4" />
            <span className="text-sm">Consultar veículos</span>
          </Link>
          <div 
            title="Em desenvolvimento"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 cursor-not-allowed opacity-50 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Consultar endereços</span>
          </div>
          <Link href="/dashboard/historico" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors mt-4">
            <History className="w-4 h-4" />
            <span className="text-sm">Histórico</span>
          </Link>
          <Link href="/dashboard?recharge=true" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Package className="w-4 h-4" />
            <span className="text-sm">Adicionar Saldo</span>
          </Link>
          <Link href="/dashboard/perfil" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
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
          <div 
            title="Em desenvolvimento"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 cursor-not-allowed opacity-50 transition-colors"
          >
            <Code className="w-4 h-4" />
            <span className="text-sm">API</span>
          </div>

          {user.role === 'ADMIN' && (
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/5 border border-red-500/10 transition-colors mt-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-bold">Painel Admin</span>
            </Link>
          )}

          <form action={logout} className="pt-2">
            <button type="submit" className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </form>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-background">
        <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-card/30 backdrop-blur-md flex items-center justify-end px-6 shadow-sm sticky top-0 z-50">
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

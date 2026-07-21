import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { History } from 'lucide-react';
import { HistoryList } from '@/components/HistoryList';

export default async function HistoricoPage() {
  const session = await verifySession();

  if (!session) {
    redirect('/login');
  }

  // Busca o histórico ordenado pelos mais recentes
  const history = await prisma.searchHistory.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Minhas Consultas
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Reveja todas as buscas e relatórios que você já realizou. Consultas passadas ficam salvas sem cobrança adicional.
            </p>
          </div>
        </div>
      </div>

      <HistoryList history={history} />
    </div>
  );
}

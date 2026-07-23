import { getDashboardMetrics, getAdvancedMetrics } from '@/app/actions/admin';
import { DollarSign, Search, Users, Activity, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const currentMonth = month ? parseInt(month) : new Date().getMonth();
  
  const metrics = await getDashboardMetrics();
  const advanced = await getAdvancedMetrics(currentMonth);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <TrendingUp className="text-primary w-8 h-8" />
            Painel de Inteligência
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-2">Visão consolidada de faturamento, lucro e performance.</p>
        </div>
        
        <DashboardClient currentMonth={currentMonth} />
      </div>

      {/* KPI Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in duration-500">
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-green-500/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-green-500/20 dark:hover:border-green-500/20">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Faturamento (Mês)</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                R$ {advanced.monthlyRevenue.toFixed(2).replace('.', ',')}
              </h3>
              <div className="flex items-center gap-1 mt-2 text-green-500 text-[10px] font-bold">
                <ArrowUpRight className="w-3 h-3" />
                EM TEMPO REAL
              </div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-primary/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-primary/20 dark:hover:border-primary/20">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Consultas (Mês)</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{advanced.monthlyQueries}</h3>
              <div className="flex items-center gap-1 mt-2 text-primary text-[10px] font-bold">
                <Activity className="w-3 h-3" />
                ATIVIDADE ALTA
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-blue-500/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-blue-500/20 dark:hover:border-blue-500/20">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Total Geral</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">R$ {metrics.totalRevenue.toFixed(2).replace('.', ',')}</h3>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-medium italic">Acumulado histórico</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-purple-500/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-purple-500/20 dark:hover:border-purple-500/20">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Usuários Ativos</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.totalUsers}</h3>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-medium italic">Base de clientes</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
        {/* Gráfico de Faturamento Diário (Com Barras Dinâmicas) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-card shadow-sm p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            Desempenho Diário (Últimos 30 dias)
          </h2>
          
          <div className="h-64 flex items-end justify-between gap-1.5 mt-10">
            {(() => {
              const entries = Object.entries(advanced.statsByDay);
              const maxDailyRevenue = Math.max(...entries.map(([_, amount]: any) => amount), 100);
              
              return entries.map(([day, amount]: any, i) => (
                <div key={day} className="flex flex-col items-center justify-end gap-2 group relative flex-1 h-full">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap z-20">
                    R$ {amount.toFixed(2)}
                  </div>
                  <div 
                    className={`w-full transition-all rounded-t-md relative ${amount > 0 ? 'bg-gradient-to-t from-[#2872fa] to-blue-400 opacity-90 group-hover:opacity-100 hover:scale-[1.05]' : 'bg-slate-200/50 dark:bg-white/5'}`}
                    style={{ height: `${amount > 0 ? Math.max((amount / maxDailyRevenue) * 100, 8) : 4}%` }}
                  >
                    {amount > 0 && <div className="absolute inset-0 bg-gradient-to-t from-[#2872fa]/20 to-transparent opacity-50"></div>}
                  </div>
                  <span className="text-[8px] text-slate-400 dark:text-gray-600 font-bold rotate-45 mt-2 origin-left truncate w-full">
                    {day.split('/')[0]}/{day.split('/')[1]}
                  </span>
                </div>
              ));
            })()}
            {Object.keys(advanced.statsByDay).length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-gray-600 italic text-sm">
                Aguardando primeiras vendas do período...
              </div>
            )}
          </div>
        </div>

        {/* Top Serviços */}
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-card shadow-sm p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Módulos mais Rentáveis
          </h2>

          <div className="space-y-6">
            {metrics.topQueries.map((q, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-600 dark:text-gray-300 uppercase tracking-tighter">{q.target.split('-')[0]}</span>
                  <span className="text-xs font-mono text-primary font-bold">{q._count.target} pedidos</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.2)]" 
                    style={{ width: `${(q._count.target / metrics.totalQueries) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {metrics.topQueries.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-gray-600 italic text-center py-10">Nenhuma consulta realizada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

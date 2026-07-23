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
          
          <div className="h-64 mt-10 relative">
            {(() => {
              const entries = Object.entries(advanced.statsByDay);
              if (entries.length === 0) {
                return (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-gray-600 italic text-sm">
                    Aguardando primeiras vendas do período...
                  </div>
                );
              }

              const maxDailyRevenue = Math.max(...entries.map(([_, amount]: any) => amount), 100);
              
              // Build SVG points
              // Y limits: 95 (bottom) to 5 (top) to give padding for the stroke
              const points = entries.map(([_, amount]: any, i) => {
                const x = (i / (entries.length - 1)) * 100;
                const y = 95 - ((amount / maxDailyRevenue) * 90);
                return `${x},${y}`;
              }).join(' ');

              const areaPoints = `0,100 ${points} 100,100`;

              return (
                <div className="w-full h-full flex flex-col justify-end relative">
                  <div className="flex-1 w-full relative group">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2872fa" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#2872fa" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <polygon points={areaPoints} fill="url(#gradientArea)" className="transition-all duration-700 ease-out" />
                      <polyline points={points} fill="none" stroke="#2872fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="transition-all duration-700 ease-out" />
                    </svg>

                    {/* Tooltips Overlay */}
                    <div className="absolute inset-0 flex justify-between">
                      {entries.map(([day, amount]: any, i) => (
                        <div key={day} className="flex-1 group/tooltip relative flex justify-center cursor-crosshair">
                          {/* Hover Guide Line */}
                          <div className="absolute top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-700 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none" />
                          
                          {/* Tooltip Box */}
                          <div className="absolute bottom-full mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity bg-slate-900 dark:bg-white text-white dark:text-black text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none transform -translate-x-1/2 left-1/2">
                            R$ {amount.toFixed(2)}
                            <div className="text-[9px] font-normal text-slate-300 dark:text-slate-600 mt-0.5">{day}</div>
                          </div>
                          
                          {/* Data Point Dot */}
                          <div 
                            className="absolute w-2 h-2 rounded-full bg-[#2872fa] ring-2 ring-white dark:ring-card opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none transform -translate-x-1/2 left-1/2"
                            style={{ top: `${95 - ((amount / maxDailyRevenue) * 90)}%`, marginTop: '-4px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Eixo X: Datas Otimizadas para não vazar */}
                  <div className="flex justify-between w-full mt-4 border-t border-slate-100 dark:border-white/5 pt-3">
                    {entries.map(([day, _]: any, i) => {
                      const showLabel = i % 5 === 0 || i === entries.length - 1;
                      return (
                        <div key={day} className="flex-1 flex justify-center">
                          {showLabel ? (
                            <span className="text-[10px] text-slate-400 dark:text-gray-500 font-medium truncate px-1">
                              {day.split('/')[0]}/{day.split('/')[1]}
                            </span>
                          ) : (
                            <span className="opacity-0 w-full">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
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

import { getDashboardMetrics, getAdvancedMetrics } from '@/app/actions/admin';
import { DollarSign, Search, Users, Activity, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';
import DashboardClient from './DashboardClient';
import PerformanceChart from '@/components/admin/PerformanceChart';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const currentPeriod = period || 'month';
  
  const metrics = await getDashboardMetrics();
  const advanced = await getAdvancedMetrics(currentPeriod);

  // Helper para traduzir o label do período selecionado
  const getPeriodLabel = (p: string) => {
    switch (p) {
      case 'today': return 'Hoje';
      case 'week': return 'Últimos 7 Dias';
      case 'month': return 'Últimos 30 Dias';
      case 'year': return 'Ano Atual';
      case 'all': return 'Histórico Completo';
      default: return 'Período';
    }
  };

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
        
        <DashboardClient currentPeriod={currentPeriod} />
      </div>

      {/* SEÇÃO 1: DESEMPENHO DE HOJE */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Métricas de Hoje (GMT-3)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in duration-500">
          {/* Faturamento Hoje */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-blue-500/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-blue-500/20">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Faturamento</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  R$ {metrics.todayRevenue.toFixed(2).replace('.', ',')}
                </h3>
                {metrics.changePercentage > 0 ? (
                  <div className="flex items-center gap-1 mt-2 text-green-500 text-[10px] font-bold">
                    <ArrowUpRight className="w-3 h-3" />
                    {metrics.changePercentage.toFixed(0)}% vs ontem
                  </div>
                ) : metrics.changePercentage < 0 ? (
                  <div className="flex items-center gap-1 mt-2 text-red-500 text-[10px] font-bold">
                    <ArrowDownRight className="w-3 h-3" />
                    {Math.abs(metrics.changePercentage).toFixed(0)}% vs ontem
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-2 text-slate-400 dark:text-gray-500 text-[10px] font-bold">
                    Igual a ontem
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Custo de API Hoje */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-red-500/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-red-500/20">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Custo de API</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  R$ {metrics.todayApiCost.toFixed(2).replace('.', ',')}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-medium">Investido em provedores</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Lucro Hoje */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-emerald-500/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-emerald-500/20">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Lucro Líquido</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  R$ {metrics.todayProfit.toFixed(2).replace('.', ',')}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-medium">Caixa líquido diário</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ROI Hoje */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-purple-500/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-purple-500/20">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">ROI (Hoje)</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {metrics.todayRoi.toFixed(0)}%
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-medium">Retorno do dia</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: DESEMPENHO DO PERÍODO SELECIONADO */}
      <div className="mb-12">
        <h2 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Métricas do Período ({getPeriodLabel(currentPeriod)})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {/* Faturamento Período */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-blue-500/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-blue-500/20">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Faturamento</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  R$ {advanced.monthlyRevenue.toFixed(2).replace('.', ',')}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-medium">Pix compensados</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Custo de API Período */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-red-500/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-red-500/20">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Custo de API</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  R$ {advanced.monthlyApiCosts.toFixed(2).replace('.', ',')}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-medium">Consultas aos provedores</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Lucro Líquido Período */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-emerald-500/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-emerald-500/20">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Lucro Líquido</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  R$ {advanced.monthlyProfit.toFixed(2).replace('.', ',')}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-medium">Líquido na conta</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* ROI Período */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-gradient-to-br dark:from-purple-500/5 dark:to-transparent shadow-sm hover:shadow-md transition-all group hover:border-purple-500/20">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">ROI (Período)</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {advanced.monthlyRoi.toFixed(0)}%
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-2 font-medium">Retorno do investimento</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
        {/* Gráfico de Faturamento Diário */}
        <div className="lg:col-span-2">
          <PerformanceChart data={advanced.chartData} />
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

      {/* SEÇÃO 3: HISTÓRICO DE ÚLTIMOS DEPÓSITOS E CONSULTAS DO DIA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 animate-in fade-in duration-800">
        {/* Últimos Depósitos */}
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-card shadow-sm p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Últimos Depósitos Recebidos
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-gray-300">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-black/20 text-slate-400 dark:text-gray-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Usuário</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Data/Hora</th>
                  <th className="px-4 py-3 text-center rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {metrics.recentSales.map((sale, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800 dark:text-white">{sale.user?.name || 'Cliente'}</div>
                      <div className="text-xs text-slate-400 dark:text-gray-500">{sale.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {sale.amount.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-500">
                      {new Date(sale.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}{' '}
                      {new Date(sale.createdAt).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400">
                        Sucesso
                      </span>
                    </td>
                  </tr>
                ))}
                {metrics.recentSales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400 dark:text-gray-600 italic">
                      Nenhum depósito recente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Consultas Realizadas Hoje */}
        <div className="glass-panel rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-card shadow-sm p-8">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Consultas Realizadas Hoje
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-gray-300">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-black/20 text-slate-400 dark:text-gray-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Módulo de Consulta</th>
                  <th className="px-4 py-3 text-center rounded-r-xl">Quantidade (Hoje)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {metrics.todayQueriesList.map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-white uppercase tracking-tighter">
                      {q.target.replace(/-/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-primary">
                      {q.count} {q.count === 1 ? 'consulta' : 'consultas'}
                    </td>
                  </tr>
                ))}
                {metrics.todayQueriesList.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-slate-400 dark:text-gray-600 italic">
                      Nenhuma consulta realizada hoje.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabela de Atribuição por Origem de Tráfego (UTMs) */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-card shadow-sm p-8 mt-12 animate-in fade-in duration-1000">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Atribuição de Tráfego (Canais & UTMs)
        </h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">Acompanhe a origem dos cadastros, o faturamento gerado por cada canal e o retorno sobre investimento (ROI).</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-gray-300">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-black/20 text-slate-400 dark:text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-l-2xl">Canal de Origem</th>
                <th className="px-6 py-4 text-center">Novos Cadastros</th>
                <th className="px-6 py-4 text-right">Faturamento Bruto</th>
                <th className="px-6 py-4 text-right">Custos Operacionais</th>
                <th className="px-6 py-4 text-right">Lucro Líquido</th>
                <th className="px-6 py-4 text-center rounded-r-2xl">ROI (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {advanced.attributionTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-white capitalize">
                    {row.source}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">
                    {row.usersCount}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    R$ {row.faturamento.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-red-500">
                    R$ {row.custos.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                    R$ {row.lucro.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      row.roi > 100 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : row.roi > 0 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {row.roi > 0 ? `+${row.roi}%` : `${row.roi}%`}
                    </span>
                  </td>
                </tr>
              ))}
              {advanced.attributionTable.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 dark:text-gray-600 italic">
                    Nenhum tráfego atribuído registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

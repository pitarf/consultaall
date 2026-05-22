import { getSalesHistory } from '@/app/actions/admin';
import { DollarSign, User, Calendar, Hash, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminVendasPage() {
  const sales = await getSalesHistory();

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <DollarSign className="text-green-500 w-8 h-8" />
          Histórico de Vendas
        </h1>
        <p className="text-slate-500 dark:text-gray-400 mt-2">Detalhamento de todas as recargas de saldo confirmadas via Pix.</p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-card shadow-sm hover:shadow-md transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-gray-300">
            <thead className="bg-slate-50 dark:bg-black/40 text-xs uppercase text-slate-500 dark:text-gray-500 font-bold tracking-wider border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Valor Bruto</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Data/Hora</th>
                <th className="px-6 py-5">Referência PushinPay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-transparent dark:bg-black/10">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 dark:text-gray-500 group-hover:text-primary transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{sale.user.name || 'Sem Nome'}</span>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500">{sale.user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-green-600 dark:text-green-400 font-mono font-bold text-base">
                      + R$ {sale.amount.toFixed(2).replace('.', ',')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-500 rounded-full text-[10px] font-bold w-fit border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      CONFIRMADO
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-white font-medium">{new Date(sale.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span className="text-[10px] text-slate-400 dark:text-gray-500">{new Date(sale.createdAt).toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-gray-500 bg-slate-100 dark:bg-white/5 p-2 rounded-lg border border-slate-200 dark:border-white/5 max-w-[200px] truncate">
                      <Hash className="w-3 h-3 opacity-30" />
                      {sale.externalId || 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-slate-400 dark:text-gray-600 italic">Nenhuma venda registrada até o momento.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

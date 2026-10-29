'use client';

import { useState, useTransition } from 'react';
import { approveDepositManual } from '@/app/actions/admin';
import { toast } from 'sonner';
import { DollarSign, User, Calendar, Hash, CheckCircle2, Clock, Check, Loader2 } from 'lucide-react';

// Interfaces tipadas para consistência técnica
interface TransactionWithUser {
  id: string;
  amount: number;
  createdAt: Date;
  externalId: string | null;
  description: string | null;
  status: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface VendasClientProps {
  initialSales: TransactionWithUser[];
  initialPending: TransactionWithUser[];
}

/**
 * Componente client-side que gerencia o histórico financeiro administrativo de vendas,
 * permitindo alternar entre recargas confirmadas e pendentes, além de realizar a aprovação manual de faturas.
 */
export default function VendasClient({ initialSales, initialPending }: VendasClientProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [sales, setSales] = useState<TransactionWithUser[]>(initialSales);
  const [pending, setPending] = useState<TransactionWithUser[]>(initialPending);
  
  // Utiliza a API de useTransition do React 19 para controlar o estado pendente de chamadas no servidor de forma assíncrona
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);

  /**
   * Aprova manualmente uma transação Pix de recarga.
   */
  const handleApprove = (transactionId: string, amount: number, clientEmail: string) => {
    if (processingId) return;

    setProcessingId(transactionId);
    
    startTransition(async () => {
      try {
        toast.info(`Processando aprovação de R$ ${amount.toFixed(2)}...`);
        const res = await approveDepositManual(transactionId);

        if ('error' in res && res.error) {
          toast.error(res.error);
        } else if ('success' in res && res.success) {
          toast.success(`Pix de R$ ${amount.toFixed(2)} aprovado para ${clientEmail}!`);
          
          // Localiza a transação que foi aprovada
          const approvedTx = pending.find(p => p.id === transactionId);
          if (approvedTx) {
            // Atualiza o status localmente para fins de reatividade instantânea na tela
            const updatedTx = { 
              ...approvedTx, 
              status: 'COMPLETED',
              description: `${approvedTx.description || 'Recarga de Saldo - Pix'} (Aprovado Manualmente por Admin)`
            };
            
            // Remove de pendentes e adiciona na lista de confirmados
            setPending(prev => prev.filter(p => p.id !== transactionId));
            setSales(prev => [updatedTx, ...prev]);
          }
        }
      } catch (err) {
        toast.error('Ocorreu um erro inesperado ao aprovar Pix.');
      } finally {
        setProcessingId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Menu de Abas Premium Responsivo */}
      <div className="flex border-b border-slate-200 dark:border-white/10 pb-px gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 sm:flex-initial pb-3.5 sm:pb-4 px-3 sm:px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-all relative whitespace-nowrap min-h-[44px] ${
            activeTab === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>Aprovações Pendentes</span>
          {pending.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 rounded-full animate-pulse">
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 sm:flex-initial pb-3.5 sm:pb-4 px-3 sm:px-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-all whitespace-nowrap min-h-[44px] ${
            activeTab === 'completed'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Histórico Confirmado</span>
          {sales.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-white/5 rounded-full">
              {sales.length}
            </span>
          )}
        </button>
      </div>

      {/* Conteúdo das Tabelas e Cards */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-card shadow-sm hover:shadow-md transition-all">
        {activeTab === 'pending' ? (
          <>
            {/* TAB 1 DESKTOP: TABELA DE PENDENTES */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left text-sm text-slate-700 dark:text-gray-300">
                <thead className="bg-slate-50 dark:bg-black/40 text-xs uppercase text-slate-500 dark:text-gray-500 font-bold tracking-wider border-b border-slate-200 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-5">Cliente</th>
                    <th className="px-6 py-5">Valor Pix</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Data da Solicitação</th>
                    <th className="px-6 py-5">ID PushinPay</th>
                    <th className="px-6 py-5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-transparent dark:bg-black/10">
                  {pending.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white">{sale.user.name || 'Sem Nome'}</span>
                            <span className="text-[10px] text-slate-400 dark:text-gray-500">{sale.user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-base">
                          R$ {sale.amount.toFixed(2).replace('.', ',')}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-full text-[10px] font-bold w-fit border border-amber-500/20">
                          <Clock className="w-3 h-3 animate-spin" />
                          PENDENTE
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
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => handleApprove(sale.id, sale.amount, sale.user.email)}
                          disabled={processingId !== null}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 rounded-xl transition-all shadow-md active:scale-95 disabled:scale-100 disabled:opacity-50"
                        >
                          {processingId === sale.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Aprovando...
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Aprovar Pix
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pending.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-24 text-slate-400 dark:text-gray-600 italic">
                        <div className="flex flex-col items-center gap-3">
                          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                          <span>Nenhum Pix aguardando aprovação manual!</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TAB 1 MOBILE: CARDS RESPONSIVOS PARA PENDENTES */}
            <div className="block md:hidden p-3.5 space-y-3">
              {pending.map((sale) => (
                <div
                  key={sale.id}
                  className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-amber-500 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {sale.user.name || 'Sem Nome'}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-gray-500 truncate">
                          {sale.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-full text-[10px] font-bold shrink-0 border border-amber-500/20">
                      <Clock className="w-3 h-3 animate-spin" />
                      PENDENTE
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/50 dark:border-white/5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase block">Valor Pix</span>
                      <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                        R$ {sale.amount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase block">Solicitado em</span>
                      <span className="text-slate-700 dark:text-gray-300 font-medium">
                        {new Date(sale.createdAt).toLocaleDateString('pt-BR')}{' '}
                        <span className="text-[10px] text-slate-400 dark:text-gray-500">
                          {new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </div>
                  </div>

                  {sale.externalId && (
                    <div className="text-[11px] font-mono text-slate-500 dark:text-gray-400 bg-white dark:bg-black/20 p-2 rounded-xl border border-slate-200/60 dark:border-white/5 truncate flex items-center gap-1.5">
                      <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{sale.externalId}</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleApprove(sale.id, sale.amount, sale.user.email)}
                    disabled={processingId !== null}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 rounded-xl transition-all shadow-md active:scale-95 disabled:scale-100 disabled:opacity-50 min-h-[44px]"
                  >
                    {processingId === sale.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Aprovando Pagamento...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Aprovar Pix Manualmente</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
              {pending.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-gray-600 gap-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  <span className="text-sm italic">Nenhum Pix aguardando aprovação manual!</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* TAB 2 DESKTOP: TABELA DE CONFIRMADOS */}
            <div className="overflow-x-auto hidden md:block">
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
                          <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors">
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
                      <td colSpan={5} className="text-center py-20 text-slate-400 dark:text-gray-600 italic">Nenhuma venda confirmada registrada até o momento.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TAB 2 MOBILE: CARDS RESPONSIVOS PARA CONFIRMADOS */}
            <div className="block md:hidden p-3.5 space-y-3">
              {sales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-100 dark:border-white/5 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-emerald-500 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                          {sale.user.name || 'Sem Nome'}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-gray-500 truncate">
                          {sale.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-500 rounded-full text-[10px] font-bold shrink-0 border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      CONFIRMADO
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/50 dark:border-white/5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase block">Valor Creditado</span>
                      <span className="text-base font-bold font-mono text-green-600 dark:text-green-400">
                        + R$ {sale.amount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase block">Data/Hora</span>
                      <span className="text-slate-700 dark:text-gray-300 font-medium">
                        {new Date(sale.createdAt).toLocaleDateString('pt-BR')}{' '}
                        <span className="text-[10px] text-slate-400 dark:text-gray-500">
                          {new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </div>
                  </div>

                  {sale.externalId && (
                    <div className="text-[11px] font-mono text-slate-500 dark:text-gray-400 bg-white dark:bg-black/20 p-2 rounded-xl border border-slate-200/60 dark:border-white/5 truncate flex items-center gap-1.5">
                      <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{sale.externalId}</span>
                    </div>
                  )}
                </div>
              ))}
              {sales.length === 0 && (
                <p className="text-center py-16 text-slate-400 dark:text-gray-600 italic text-sm">
                  Nenhuma venda confirmada registrada até o momento.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

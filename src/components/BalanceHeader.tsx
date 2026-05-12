'use client';

import React, { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { RechargeModal } from './RechargeModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface BalanceHeaderProps {
  initialBalance: number;
}

export function BalanceHeader({ initialBalance }: BalanceHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Abre o modal se houver ?recharge=true na URL
  useEffect(() => {
    if (searchParams.get('recharge') === 'true') {
      setIsModalOpen(true);
      // Limpa o parâmetro da URL sem recarregar a página para não reabrir ao dar F5
      const params = new URLSearchParams(searchParams.toString());
      params.delete('recharge');
      router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  const handleSuccess = () => {
    // Força o Next.js a revalidar os dados do servidor (layout.tsx buscará o novo saldo)
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Card de Saldo */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#1e293b] px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 cursor-pointer transition-all group shadow-sm"
        >
          <div className="p-1.5 bg-green-500/10 rounded-lg text-green-500 group-hover:scale-110 transition-transform">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Seu Saldo</span>
            <span className="text-sm font-black text-slate-900 dark:text-green-400 leading-none">
              R$ {initialBalance.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="ml-2 p-1 bg-primary text-white rounded-md shadow-lg shadow-primary/20">
            <Plus className="w-3 h-3" />
          </div>
        </div>
      </div>

      <RechargeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess}
      />
    </>
  );
}

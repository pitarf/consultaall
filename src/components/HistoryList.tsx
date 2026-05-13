'use client';

import React, { useState } from 'react';
import { Calendar, ChevronRight, DollarSign, Target, Search } from 'lucide-react';
import { Drawer } from './Drawer';
import { DataViewer } from './DataViewer';

interface HistoryItem {
  id: string;
  target: string;
  query: string;
  status: string;
  result: any;
  cost: number;
  createdAt: Date;
}

interface HistoryListProps {
  history: HistoryItem[];
}

export function HistoryList({ history }: HistoryListProps) {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDetails = (item: HistoryItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const targetMap: Record<string, string> = {
    'cpf': 'CPF',
    'nome': 'Nome',
    'telefone': 'Telefone',
    'email': 'E-mail',
    'cpf-detalhada-pessoa-fisica': 'CPF Plus'
  };

  const getTargetLabel = (target: string) => {
    return targetMap[target] || target.replace(/-/g, ' ').toUpperCase();
  };

  if (history.length === 0) {
    return (
      <div className="bg-[#0f172a] p-16 flex flex-col items-center justify-center text-center rounded-3xl border border-white/5 shadow-2xl">
        <div className="p-4 bg-white/5 rounded-full mb-6">
          <Search className="w-12 h-12 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Nenhuma consulta encontrada</h3>
        <p className="text-slate-400 max-w-xs">Você ainda não realizou nenhuma consulta na plataforma. Inicie uma busca no Dashboard!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {history.map((item) => (
        <div 
          key={item.id} 
          className="group relative bg-[#0f172a] p-4 rounded-xl border border-white/5 hover:border-primary/40 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:shadow-primary/5"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/5 rounded-lg text-slate-400 group-hover:text-primary transition-colors shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`px-2 py-0.5 text-[9px] font-black rounded-md tracking-wider uppercase ${
                  item.status === 'SUCCESS' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {item.status === 'SUCCESS' ? 'Sucesso' : 'Falha'}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3" />
                  {item.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-primary/90 transition-colors">
                {getTargetLabel(item.target)}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Chave:</span>
                <span className="text-slate-400 font-mono text-xs">{item.query}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-6 border-t border-white/5 md:border-0 pt-3 md:pt-0">
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end text-slate-500 mb-0.5">
                <DollarSign className="w-2.5 h-2.5" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Custo</span>
              </div>
              <p className="text-lg font-black text-green-400 tracking-tight">
                <span className="text-[10px] mr-1 opacity-70">R$</span>
                {item.cost.toFixed(2).replace('.', ',')}
              </p>
            </div>
            
            <button 
              onClick={() => handleOpenDetails(item)}
              className="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 p-2 rounded-lg border border-primary/20 shadow-lg group-hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}

      {/* Modal Lateral de Detalhes */}
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={selectedItem ? getTargetLabel(selectedItem.target) : 'Detalhes da Consulta'}
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">Data da Consulta</p>
                <p className="text-white font-medium">
                  {selectedItem.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest">Valor Pago</p>
                <p className="text-green-400 font-bold">R$ {selectedItem.cost.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>

            <DataViewer 
              data={selectedItem.result} 
              title={`Resultado: ${selectedItem.query}`} 
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}

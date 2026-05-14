'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { atualizarPrecoModulo } from '@/app/actions/precos';
import { DollarSign, Save, Edit2, X, Tag } from 'lucide-react';

interface Modulo {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
}

interface Props {
  modulos: Modulo[];
}

export default function PrecosClient({ modulos: modulosIniciais }: Props) {
  const router = useRouter();
  
  // Estado local para os módulos para garantir reatividade
  const [listaModulos, setListaModulos] = useState<Modulo[]>(modulosIniciais);
  
  // Estado de edição
  const [editando, setEditando] = useState<string | null>(null);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState<string | null>(null);

  /**
   * Inicia a edição de um módulo
   */
  function iniciarEdicao(modulo: Modulo) {
    setEditando(modulo.id);
    setValores((prev) => ({ 
      ...prev, 
      [modulo.id]: modulo.price.toString().replace('.', ',') 
    }));
  }

  /**
   * Cancela a edição
   */
  function cancelarEdicao() {
    setEditando(null);
  }

  /**
   * Salva o novo preço
   */
  async function salvarPreco(modulo: Modulo) {
    const valorDigitado = valores[modulo.id] || '0';
    const novoValor = parseFloat(valorDigitado.replace(',', '.'));

    if (isNaN(novoValor) || novoValor < 0) {
      toast.error('Valor inválido. Digite um número positivo (ex: 2,50)');
      return;
    }

    setSalvando(modulo.id);
    const result = await atualizarPrecoModulo(modulo.id, novoValor);
    setSalvando(null);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Preço de "${modulo.name}" atualizado!`);
      
      // Atualiza o estado local para refletir na UI sem mutação direta
      setListaModulos((prev) => 
        prev.map((m) => (m.id === modulo.id ? { ...m, price: novoValor } : m))
      );
      
      setEditando(null);
      router.refresh();
    }
  }

  // Agrupa os módulos por categoria usando a lista do estado
  const modulosPorCategoria = listaModulos.reduce((acc, modulo) => {
    const cat = modulo.category || 'Outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(modulo);
    return acc;
  }, {} as Record<string, Modulo[]>);

  return (
    <div>
      {/* Header da Página */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
            <Tag className="w-5 h-5 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Tabela de Preços</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Gerencie o valor cobrado por consulta de cada módulo. As alterações entram em vigor imediatamente.
        </p>
      </div>

      {/* Aviso */}
      <div className="glass-panel border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <DollarSign className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-yellow-400">Atenção:</span> Os preços são cobrados em Reais (R$) por consulta individual. Alterações afetam todas as novas consultas imediatamente.
        </p>
      </div>

      {/* Tabelas de Preços por Categoria */}
      <div className="space-y-8">
        {Object.entries(modulosPorCategoria).map(([categoria, listaModulos]) => (
          <div key={categoria} className="glass-panel rounded-2xl overflow-hidden">
            <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h2 className="text-lg font-bold text-white">{categoria}</h2>
            </div>
            
            <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <div className="col-span-5">Módulo</div>
              <div className="col-span-4">Descrição</div>
              <div className="col-span-2 text-right">Preço Atual</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-white/5">
              {listaModulos.map((modulo) => (
                <div key={modulo.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/2 transition-colors">
                  {/* Nome do módulo */}
                  <div className="col-span-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-semibold text-white text-sm">{modulo.name}</span>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="col-span-4">
                    <span className="text-gray-500 text-sm">{modulo.description || '—'}</span>
                  </div>

                  {/* Preço - Modo leitura ou edição */}
                  <div className="col-span-2 text-right">
                    {editando === modulo.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-gray-400 text-sm">R$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="w-24 bg-background border border-primary/50 rounded-lg px-2 py-1.5 text-sm text-right text-white focus:outline-none focus:border-primary"
                          value={valores[modulo.id] ?? ''}
                          onChange={(e) => setValores((prev) => ({ ...prev, [modulo.id]: e.target.value }))}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-white">
                        R$ {modulo.price.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>

                  {/* Botões de ação */}
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    {editando === modulo.id ? (
                      <>
                        <button
                          onClick={() => salvarPreco(modulo)}
                          disabled={salvando === modulo.id}
                          className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center hover:bg-green-500/30 transition-colors disabled:opacity-50"
                          title="Salvar"
                        >
                          <Save className="w-4 h-4 text-green-400" />
                        </button>
                        <button
                          onClick={cancelarEdicao}
                          className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => iniciarEdicao(modulo)}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        title="Editar preço"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modulos.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Tag className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Nenhum módulo de preço cadastrado.</p>
          <p className="text-sm mt-1">Execute o comando de seed para popular os módulos.</p>
        </div>
      )}
    </div>
  );
}

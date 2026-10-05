'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { atualizarPrecoModulo } from '@/app/actions/precos';
import { DollarSign, Save, Edit2, X, Tag, Search, Filter } from 'lucide-react';

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

// Ordem prioritária de categorias para facilitar a navegação rápida
const CATEGORY_ORDER = [
  'Crédito e Histórico',
  'Dados pessoais',
  'Empresas',
  'Patrimônio e Renda',
  'Pessoas relacionadas',
  'Veículos',
  'Outros'
];

export default function PrecosClient({ modulos: modulosIniciais }: Props) {
  const router = useRouter();
  
  // Estado local para os módulos
  const [listaModulos, setListaModulos] = useState<Modulo[]>(modulosIniciais);
  
  // Busca e filtro por texto
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

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
      [modulo.id]: modulo.price.toFixed(2).replace('.', ',') 
    }));
  }

  /**
   * Cancela a edição
   */
  function cancelarEdicao() {
    setEditando(null);
  }

  /**
   * Salva o novo preço sanitizando vírgulas e pontos
   */
  async function salvarPreco(modulo: Modulo) {
    const rawVal = valores[modulo.id] ?? '';
    // Converte vírgula para ponto e remove caracteres não-numéricos (exceto ponto)
    const sanitized = rawVal.replace(',', '.').trim();
    const novoValor = parseFloat(sanitized);

    if (isNaN(novoValor) || novoValor < 0) {
      toast.error('Valor inválido. Digite um número positivo (ex: 4,90 ou 4.90)');
      return;
    }

    setSalvando(modulo.id);
    const result = await atualizarPrecoModulo(modulo.id, novoValor);
    setSalvando(null);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Preço de "${modulo.name}" alterado para R$ ${novoValor.toFixed(2).replace('.', ',')}!`);
      
      // Atualiza o estado local
      setListaModulos((prev) => 
        prev.map((m) => (m.id === modulo.id ? { ...m, price: novoValor } : m))
      );
      
      setEditando(null);
      router.refresh();
    }
  }

  // Lista de todas as categorias únicas
  const todasCategorias = useMemo(() => {
    const set = new Set<string>();
    listaModulos.forEach(m => set.add(m.category || 'Outros'));
    return Array.from(set).sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a);
      const idxB = CATEGORY_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [listaModulos]);

  // Filtra módulos baseado na busca e categoria selecionada
  const modulosFiltrados = useMemo(() => {
    return listaModulos.filter(m => {
      const matchCat = selectedCategory === 'TODAS' || (m.category || 'Outros') === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term || 
        m.name.toLowerCase().includes(term) || 
        m.id.toLowerCase().includes(term) || 
        (m.category && m.category.toLowerCase().includes(term)) ||
        (m.description && m.description.toLowerCase().includes(term));
      return matchCat && matchSearch;
    });
  }, [listaModulos, searchTerm, selectedCategory]);

  // Agrupa os módulos filtrados por categoria ordenada
  const modulosPorCategoria = useMemo(() => {
    const acc: Record<string, Modulo[]> = {};
    modulosFiltrados.forEach(modulo => {
      const cat = modulo.category || 'Outros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(modulo);
    });
    return acc;
  }, [modulosFiltrados]);

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shadow-sm">
            <Tag className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Tabela de Preços</h1>
            <p className="text-slate-500 dark:text-gray-400 text-xs md:text-sm">
              Gerencie o valor cobrado por consulta de cada módulo.
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa Rápida e Filtros Mobile-First */}
      <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar módulo (ex: Processos, Veículo, CPF, Nome, E-mail)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-primary transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Tags de Categoria para Acesso Instantâneo */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('TODAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'TODAS'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300'
            }`}
          >
            Todas ({listaModulos.length})
          </button>
          {todasCategorias.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabelas e Cards de Preços por Categoria */}
      <div className="space-y-6">
        {Object.entries(modulosPorCategoria).map(([categoria, itens]) => (
          <div key={categoria} className="bg-white dark:bg-card border border-slate-200 dark:border-white/10 shadow-sm rounded-2xl overflow-hidden">
            {/* Cabeçalho da Categoria */}
            <div className="bg-slate-50 dark:bg-black/20 px-5 py-3.5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">{categoria}</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-gray-400">
                {itens.length} {itens.length === 1 ? 'módulo' : 'módulos'}
              </span>
            </div>
            
            {/* Lista com Renderização Responsiva */}
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {itens.map((modulo) => (
                <div 
                  key={modulo.id} 
                  className={`p-4 md:px-6 md:py-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    modulo.id === 'processos' ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.06]' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  {/* Informações do Módulo */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
                          {modulo.name}
                        </span>
                        {modulo.id === 'processos' && (
                          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            Custo API DirectData: R$ 3,30
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-2">
                        {modulo.description || `Módulo técnico: ${modulo.id}`}
                      </p>
                    </div>
                  </div>

                  {/* Edição e Preço (Layout Otimizado para Mobile e Desktop) */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-100 dark:border-white/5 sm:border-0">
                    <span className="sm:hidden text-xs font-semibold text-slate-400">Preço da consulta:</span>

                    {editando === modulo.id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 dark:bg-black/60 border-2 border-primary rounded-xl px-2.5 py-1.5 shadow-sm">
                          <span className="text-slate-500 dark:text-gray-400 text-xs font-bold mr-1">R$</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            className="w-20 bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                            value={valores[modulo.id] ?? ''}
                            onChange={(e) => setValores((prev) => ({ ...prev, [modulo.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') salvarPreco(modulo);
                              if (e.key === 'Escape') cancelarEdicao();
                            }}
                            autoFocus
                          />
                        </div>

                        <button
                          onClick={() => salvarPreco(modulo)}
                          disabled={salvando === modulo.id}
                          className="h-9 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                          title="Salvar novo preço"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Salvar</span>
                        </button>
                        <button
                          onClick={cancelarEdicao}
                          className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-300 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-white/20 active:scale-95 transition-all"
                          title="Cancelar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-base md:text-lg font-black text-slate-900 dark:text-white">
                            R$ {modulo.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <button
                          onClick={() => iniciarEdicao(modulo)}
                          className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-primary hover:text-white dark:bg-white/5 dark:hover:bg-primary dark:hover:text-white border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                          title="Clique para editar este valor"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-primary group-hover:text-white" />
                          <span>Alterar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modulosFiltrados.length === 0 && (
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-white/10 p-12 text-center text-slate-400">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-slate-700 dark:text-gray-300">Nenhum módulo encontrado para a busca "{searchTerm}".</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('TODAS'); }} 
            className="mt-3 text-xs text-primary font-bold hover:underline"
          >
            Limpar filtros e exibir todos
          </button>
        </div>
      )}
    </div>
  );
}

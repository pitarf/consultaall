'use client';

import { useState, useEffect } from 'react';
import { realizarConsulta, getPricing } from '@/app/actions/consultas';
import { getUserProfile } from '@/app/actions/perfil';
import { validarChave } from '@/lib/validators';
import { toast } from 'sonner';
import { Search, Loader2, HelpCircle, FlaskConical, Zap } from 'lucide-react';
import { DataViewer } from '@/components/DataViewer';
import { Tooltip } from '@/components/Tooltip';

// Estrutura visual base (custos serão sobrescritos pelo banco)
const INITIAL_DATA_MODULES = [
  {
    title: 'Dados pessoais',
    items: [
      { id: 'dados_basicos', label: 'Dados básicos', cost: 1.0 },
      { id: 'documentos', label: 'Documentos (RG/PIS/NIS)', cost: 1.0 },
      { id: 'emails', label: 'E-mails', cost: 0.5 },
      { id: 'telefones', label: 'Telefones', cost: 0.5 },
      { id: 'enderecos', label: 'Endereços', cost: 1.0 },
    ]
  },
  {
    title: 'Pessoas relacionadas',
    items: [
      { id: 'parentes', label: 'Parentes', cost: 1.0 },
      { id: 'vizinhos', label: 'Vizinhos', cost: 1.0 },
      { id: 'socio_empresa', label: 'Sócios/Empresas', cost: 1.5 },
    ]
  },
  {
    title: 'Patrimônio e Renda',
    items: [
      { id: 'poder_aquisitivo', label: 'Poder Aquisitivo', cost: 1.5 },
      { id: 'veiculos', label: 'Veículos', cost: 1.5 },
      { id: 'dados_trabalhistas', label: 'Dados Trabalhistas', cost: 1.0 },
      { id: 'seguro_social', label: 'Seguro Social (INSS)', cost: 1.0 },
      { id: 'dados_universitarios', label: 'Dados Universitários', cost: 0.5 },
    ]
  },
  {
    title: 'Crédito e Histórico',
    items: [
      { id: 'analise_credito', label: 'Score de Crédito', cost: 2.0 },
      { id: 'processos', label: 'Processos Judiciais', cost: 1.0 },
      { id: 'certidoes', label: 'Certidões Negativas', cost: 1.0 },
    ]
  }
];

export default function DashboardPage() {
  const [chaveTipo, setChaveTipo] = useState('telefone');
  const [chaveValor, setChaveValor] = useState('');
  const [modules, setModules] = useState(INITIAL_DATA_MODULES);
  
  // Estado para guardar quais IDs de módulos estão marcados
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // Carrega preços reais e verifica se é admin
  useEffect(() => {
    async function loadData() {
      try {
        const [pricing, profile] = await Promise.all([
          getPricing(),
          getUserProfile()
        ]);

        if (profile?.role === 'ADMIN') {
          setIsAdmin(true);
        }

        const updatedModules = INITIAL_DATA_MODULES.map(cat => ({
          ...cat,
          items: cat.items.map(item => {
            const dbPrice = pricing.find(p => p.id === item.id);
            return { ...item, cost: dbPrice ? dbPrice.price : 1.0 };
          })
        }));
        setModules(updatedModules);
      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err);
      }
    }
    loadData();
  }, []);

  // Filtra os módulos baseados no tipo de busca selecionado
  const availableModules = modules.map(category => {
    // Se não for CPF, filtramos o que a Direct Data Advanced não costuma entregar
    if (chaveTipo !== 'cpf') {
      const filteredItems = category.items.filter(item => 
        ['dados_basicos', 'documentos', 'emails', 'telefones', 'enderecos', 'parentes', 'vizinhos', 'socio_empresa'].includes(item.id)
      );
      if (filteredItems.length === 0) return null;
      return { ...category, items: filteredItems };
    }
    return category;
  }).filter(Boolean) as typeof INITIAL_DATA_MODULES;

  // Calcula o custo total dinâmico baseado nos módulos DISPONÍVEIS e selecionados
  const totalCost = selectedModules.reduce((total, moduleId) => {
    for (const category of availableModules) {
      const found = category.items.find(item => item.id === moduleId);
      if (found) return total + found.cost;
    }
    return total;
  }, 0);

  const toggleModule = (id: string) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleToggleAll = (categoryItems: {id: string}[], isChecked: boolean) => {
    const ids = categoryItems.map(i => i.id);
    if (isChecked) {
      setSelectedModules(prev => [...new Set([...prev, ...ids])]);
    } else {
      setSelectedModules(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const handleSearch = async () => {
    // Validação preventiva no Frontend
    const validation = validarChave(chaveTipo, chaveValor);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    if (selectedModules.length === 0) {
      toast.warning('Selecione ao menos um conjunto de dados para consultar.');
      return;
    }

    setLoading(true);
    setResultado(null);
    
    if (isDemo) {
      toast.info(`Iniciando consulta em modo DEMO (Sem custos)`);
    } else {
      toast.info(`Consultando... Custo estimado: R$ ${totalCost.toFixed(2).replace('.', ',')}`);
    }

    try {
      const res = await realizarConsulta(chaveTipo, chaveValor, selectedModules, isDemo);
      
      if (res.error) {
        toast.error(res.error);
      } else if (res.success) {
        if (res.isDemo) {
          toast.success(`Consulta DEMO realizada com sucesso! Nenhum saldo foi debitado.`);
        } else if (res.isCached) {
          toast.success(`Resultado recuperado do cache (Atualizado nas últimas 48h). Saldo preservado!`);
        } else {
          toast.success(`Consulta realizada! Debitados: R$ ${totalCost.toFixed(2).replace('.', ',')}. Novo saldo: R$ ${res.newBalance.toFixed(2).replace('.', ',')}`);
        }
        setResultado(res.data);
      }
    } catch (err) {
      toast.error('Erro inesperado ao realizar consulta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Consultar pessoas</h1>
      </div>

      {/* 1. Chaves de busca */}
      <section className="bg-white dark:bg-card rounded-lg shadow-sm border border-slate-200 dark:border-white/10 p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">1. Chaves de busca</h2>
        
        <div className="flex flex-col md:flex-row shadow-sm rounded-md border border-slate-300 dark:border-white/10">
          <div className="md:w-1/4 bg-slate-50 dark:bg-black/20 border-b md:border-b-0 md:border-r border-slate-300 dark:border-white/10">
            <select 
              value={chaveTipo}
              onChange={(e) => {
                setChaveTipo(e.target.value);
                setChaveValor('');
              }}
              className="w-full h-full p-3 bg-transparent text-slate-700 dark:text-gray-300 outline-none appearance-none"
            >
              <option value="telefone">Telefone</option>
              <option value="cpf">CPF</option>
              <option value="nome">Nome</option>
              <option value="email">E-mail</option>
            </select>
          </div>
          <div className="md:w-3/4 flex items-center bg-white dark:bg-transparent relative">
            <input 
              type="text" 
              value={chaveValor}
              onChange={(e) => setChaveValor(e.target.value)}
              placeholder={
                chaveTipo === 'telefone' ? '(00) 00000-0000' :
                chaveTipo === 'cpf' ? '000.000.000-00' :
                chaveTipo === 'nome' ? 'Nome completo...' :
                'exemplo@email.com'
              } 
              className="w-full p-3 bg-transparent text-slate-800 dark:text-white outline-none"
            />
              <div className="absolute right-4">
                <Tooltip text="Escolha o tipo de documento que você possui. O CPF garante a maior precisão.">
                  <HelpCircle className="w-5 h-5 text-slate-400 cursor-help hover:text-primary transition-colors" />
                </Tooltip>
              </div>
          </div>
        </div>
        
        <p className="mt-3 text-sm text-slate-500 dark:text-gray-400 flex items-center gap-2">
          <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-300 w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-xs">i</span>
          Para uma maior assertividade, considere utilizar as chaves de busca <strong className="text-slate-700 dark:text-white">CPF</strong> ou <strong className="text-slate-700 dark:text-white">nome</strong>.
        </p>
      </section>

      {/* 2. Conjuntos de dados */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">2. Conjuntos de dados</h2>
          <div className="text-sm font-medium bg-green-500/10 text-green-500 px-3 py-1.5 rounded-md">
            Custo total: R$ {totalCost.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableModules.map((category, idx) => {
            const allChecked = category.items.every(i => selectedModules.includes(i.id));
            
            return (
              <div key={idx} className="bg-white dark:bg-card rounded-lg shadow-sm border border-slate-200 dark:border-white/10 p-5 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{category.title}</h3>
                  <Tooltip text={
                    category.title === 'Dados pessoais' ? 'Dados básicos, e-mails e endereços diretos.' :
                    category.title === 'Dados de pessoas relacionadas' ? 'Parentes e pessoas que moram no mesmo endereço.' :
                    category.title === 'Renda e patrimônio' ? 'Vínculos de emprego e estimativas de renda.' :
                    category.title === 'Comportamento e reputação' ? 'Processos e histórico público.' :
                    category.title === 'Certidões negativas' ? 'Antecedentes e certidões de tribunais.' :
                    'Análise de crédito e probabilidade de inadimplência.'
                  }>
                    <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                  </Tooltip>
                </div>
                
                <div className="space-y-3 flex-1">
                  {category.items.map((item) => (
                    <label key={item.id} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={selectedModules.includes(item.id)}
                          onChange={() => toggleModule(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary dark:bg-black/50"
                        />
                        <span className="text-sm text-slate-600 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                      </div>
                      <span className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full font-medium">
                        R$ {item.cost.toFixed(2).replace('.', ',')}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={allChecked}
                      onChange={(e) => handleToggleAll(category.items, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary dark:bg-black/50"
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-white">Todos</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Botão de Ação e Switch de Admin */}
      <div className="flex flex-col md:flex-row items-center justify-end gap-6">
        {isAdmin && (
          <div className="flex items-center gap-3 bg-white/5 p-2 px-4 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-right-4">
            <div className={`p-1.5 rounded-lg ${isDemo ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
              {isDemo ? <FlaskConical className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Modo de Operação</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold transition-colors ${!isDemo ? 'text-primary' : 'text-gray-500'}`}>REAL</span>
                <button 
                  onClick={() => setIsDemo(!isDemo)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isDemo ? 'bg-amber-500' : 'bg-primary'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDemo ? 'left-6' : 'left-1'}`}></div>
                </button>
                <span className={`text-xs font-bold transition-colors ${isDemo ? 'text-amber-500' : 'text-gray-500'}`}>DEMO</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={loading || totalCost === 0}
          className={`px-8 py-3 rounded-xl flex items-center gap-2 font-bold shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDemo 
              ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20' 
              : 'btn-premium'
          }`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isDemo ? <FlaskConical className="w-5 h-5" /> : <Search className="w-5 h-5" />)}
          {isDemo ? 'Testar Consulta (Grátis)' : `Realizar Consulta (R$ ${totalCost.toFixed(2).replace('.', ',')})`}
        </button>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="mt-8">
          <DataViewer data={resultado} title="Relatório de Consulta" />
        </div>
      )}
    </div>
  );
}

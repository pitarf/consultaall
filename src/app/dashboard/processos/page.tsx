'use client';

import { useState, useEffect } from 'react';
import { realizarConsulta, getPricing } from '@/app/actions/consultas';
import { getUserProfile } from '@/app/actions/perfil';
import { validarChave } from '@/lib/validators';
import { toast } from 'sonner';
import { Search, Loader2, FlaskConical, HelpCircle, ChevronDown, Zap, User, Building2, Scale, Info, CheckCircle2, ShieldAlert, Gavel, FileCheck, Landmark } from 'lucide-react';
import { DataViewer } from '@/components/DataViewer';
import { Tooltip } from '@/components/Tooltip';

// Módulos e Opções de Consulta de Processos Judiciais com detalhamento completo
const INITIAL_PROCESSOS_MODULES = [
  {
    title: 'Processos e Cobertura Judicial',
    items: [
      { 
        id: 'processos', 
        label: 'Processos Judiciais (Completo)', 
        desc: 'Varas Cíveis, Família, Criminais, Fazenda Pública, Juizados Especiais e Execuções Fiscais em Tribunais de Justiça (TJs), Tribunais Regionais Federais (TRFs) e Justiça do Trabalho (TRTs). Inclui número CNJ, comarca, vara, assunto, partes e andamentos.',
        cost: 1.0 
      },
      { 
        id: 'certidoes', 
        label: 'Certidões Negativas e Falências', 
        desc: 'Checagem de certidões judiciais de distribuição, antecedentes cíveis, falências, concordatas e recuperações judiciais.',
        cost: 1.0 
      },
    ]
  },
  {
    title: 'Análise Jurídica e Risco Financeiro',
    items: [
      { 
        id: 'analise_credito', 
        label: 'Score e Risco de Crédito', 
        desc: 'Avaliação de probabilidade de inadimplência, restrições financeiras e capacidade de pagamento associada ao histórico judicial.',
        cost: 2.0 
      },
    ]
  }
];

export default function ProcessosPage() {
  const [chaveTipo, setChaveTipo] = useState('cpf');
  const [chaveValor, setChaveValor] = useState('');
  const [chaveUf, setChaveUf] = useState('');
  const [modules, setModules] = useState(INITIAL_PROCESSOS_MODULES);
  const [selectedModules, setSelectedModules] = useState<string[]>(['processos']);
  
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[] | null>(null);
  const [candidatePage, setCandidatePage] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        const updatedModules = INITIAL_PROCESSOS_MODULES.map(cat => ({
          ...cat,
          items: cat.items.map(item => {
            const dbPrice = pricing.find(p => p.id === item.id);
            return { ...item, cost: dbPrice ? dbPrice.price : item.cost };
          })
        }));
        setModules(updatedModules);
      } catch (err) {
        console.error("Erro ao carregar dados iniciais:", err);
      }
    }
    loadData();
  }, []);

  // Cálculo dinâmico do custo total baseado nos módulos selecionados
  const totalCost = selectedModules.reduce((total, moduleId) => {
    for (const category of modules) {
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
    if (loading) return;
    setError(null);
    setResultado(null);
    setCandidates(null);

    const validation = validarChave(chaveTipo, chaveValor);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    if (selectedModules.length === 0) {
      toast.warning('Selecione ao menos uma opção ou módulo de processo para consultar.');
      return;
    }

    setLoading(true);
    
    if (isDemo) {
      toast.info(`Iniciando consulta em modo DEMO (Sem custos)`);
    } else {
      toast.info(`Consultando... Custo: R$ ${totalCost.toFixed(2).replace('.', ',')}`);
    }

    try {
      const res = await realizarConsulta(chaveTipo, chaveValor, selectedModules, isDemo, undefined, chaveTipo === 'nome' ? chaveUf : undefined);
      
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
      } else if (res.success) {
        if (res.isMultiple) {
          setCandidates(res.candidates);
          setCandidatePage(1);
          toast.success(`${res.candidates.length} perfis correspondentes encontrados.`);
        } else {
          if (res.isDemo) {
            toast.success(`Consulta DEMO realizada com sucesso! Nenhum saldo foi debitado.`);
          } else if (res.isCached) {
            toast.success(`Resultado recuperado do cache (Atualizado nas últimas 48h). Saldo preservado!`);
          } else {
            toast.success(`Consulta realizada! Debitados: R$ ${totalCost.toFixed(2).replace('.', ',')}. Novo saldo: R$ ${res.newBalance.toFixed(2).replace('.', ',')}`);
          }
          setResultado(res.data);
        }
      }
    } catch (err) {
      toast.error('Erro inesperado ao realizar consulta.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = async (candidateId: string) => {
    if (loading) return;
    setError(null);
    setCandidates(null);
    setLoading(true);
    setResultado(null);

    if (isDemo) {
      toast.info(`Iniciando consulta do candidato em modo DEMO (Sem custos)`);
    } else {
      toast.info(`Consultando candidato... Custo: R$ ${totalCost.toFixed(2).replace('.', ',')}`);
    }

    try {
      const res = await realizarConsulta(chaveTipo, chaveValor, selectedModules, isDemo, candidateId);
      
      if (res.error) {
        setError(res.error);
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
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Consultar processos judiciais</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Busque históricos de processos por CPF, CNPJ ou Nome em tribunais de todo o Brasil.</p>
        </div>
        <div className="text-sm font-semibold bg-green-500/10 text-green-500 px-3 py-1.5 rounded-md self-start sm:self-auto border border-green-500/20">
          Custo da consulta: R$ {totalCost.toFixed(2).replace('.', ',')}
        </div>
      </div>

      <section className="bg-white dark:bg-card rounded-xl shadow-sm border border-slate-200 dark:border-white/10 p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scale className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">O que você pode pesquisar</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Selecione abaixo a modalidade de busca desejada para consultar histórico de processos judiciais:
          </p>
        </div>

        {/* Cartões de seleção de modalidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => { setChaveTipo('cpf'); setChaveValor(''); }}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              chaveTipo === 'cpf'
                ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20 shadow-sm'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${chaveTipo === 'cpf' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-300'}`}>
                  <User className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-800 dark:text-white">Pessoa Física (CPF)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${chaveTipo === 'cpf' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                Recomendado
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Busca direta e precisa em tribunais estaduais (TJ) e federais (TRF) vinculados ao CPF.
            </p>
          </button>

          <button
            type="button"
            onClick={() => { setChaveTipo('cnpj'); setChaveValor(''); }}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              chaveTipo === 'cnpj'
                ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20 shadow-sm'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${chaveTipo === 'cnpj' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-300'}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-800 dark:text-white">Pessoa Jurídica (CNPJ)</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${chaveTipo === 'cnpj' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                Empresas
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Localize processos cíveis, fiscais e trabalhistas em que a empresa figura como parte.
            </p>
          </button>

          <button
            type="button"
            onClick={() => { setChaveTipo('nome'); setChaveValor(''); }}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              chaveTipo === 'nome'
                ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20 shadow-sm'
                : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${chaveTipo === 'nome' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-gray-300'}`}>
                  <Search className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-800 dark:text-white">Nome Completo</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${chaveTipo === 'nome' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                Nominal
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Busca nominal com filtro por UF. Lista candidatos homônimos para confirmação sem gastar saldo antecipadamente.
            </p>
          </button>
        </div>

        <div className="flex flex-col md:flex-row shadow-sm rounded-xl border border-slate-300 dark:border-white/10 overflow-hidden">
          <div className="md:w-1/4 bg-slate-50 dark:bg-black/20 border-b md:border-b-0 md:border-r border-slate-300 dark:border-white/10 relative">
            <select 
              value={chaveTipo}
              onChange={(e) => {
                setChaveTipo(e.target.value);
                setChaveValor('');
              }}
              className="w-full h-full p-3.5 pr-12 bg-transparent text-slate-700 dark:text-gray-300 outline-none appearance-none cursor-pointer relative z-10 font-semibold text-sm"
            >
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="nome">Nome Completo</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary/10 text-primary p-1 rounded-md pointer-events-none z-0">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <div className="md:w-3/4 flex items-center bg-white dark:bg-transparent relative">
            <input 
              type="text" 
              value={chaveValor}
              onChange={(e) => setChaveValor(e.target.value)}
              placeholder={
                chaveTipo === 'cpf' ? '000.000.000-00' :
                chaveTipo === 'cnpj' ? '00.000.000/0000-00' :
                'Nome completo...'
              } 
              className={`w-full p-3 bg-transparent text-slate-800 dark:text-white outline-none ${chaveTipo === 'nome' ? 'md:w-2/3' : ''}`}
            />
            {chaveTipo === 'nome' && (
              <div className="w-1/3 border-l border-slate-300 dark:border-white/10 relative h-full">
                <select
                  value={chaveUf}
                  onChange={(e) => setChaveUf(e.target.value)}
                  className="w-full h-full p-3 pr-8 bg-transparent text-slate-700 dark:text-gray-300 outline-none appearance-none cursor-pointer relative z-10"
                >
                  <option value="">Brasil (Todos)</option>
                  <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option>
                  <option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option>
                  <option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option>
                  <option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
                  <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option>
                  <option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option>
                  <option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option>
                  <option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
                  <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-0">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            )}
            <div className="absolute right-4">
              <Tooltip text="Escolha CPF ou CNPJ para maior assertividade. Busca por Nome retorna múltiplos candidatos homônimos.">
                <HelpCircle className="w-5 h-5 text-slate-400 cursor-help hover:text-primary transition-colors" />
              </Tooltip>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Opções e Tabela de Preços dos Módulos */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-primary" />
              2. Opções de consulta e tabela de preços
            </h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Escolha os conjuntos de dados jurídicos que deseja incluir no relatório:
            </p>
          </div>
          <div className="text-sm font-semibold bg-green-500/10 text-green-500 px-3.5 py-1.5 rounded-lg border border-green-500/20">
            Custo total: R$ {totalCost.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((category, idx) => {
            const allChecked = category.items.every(i => selectedModules.includes(i.id));
            
            return (
              <div key={idx} className="bg-white dark:bg-card rounded-xl shadow-sm border border-slate-200 dark:border-white/10 p-5 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                    {category.title.includes('Processos') ? <Scale className="w-4 h-4 text-primary" /> : <ShieldAlert className="w-4 h-4 text-indigo-500" />}
                    {category.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                    {category.items.length} opções
                  </span>
                </div>
                
                <div className="space-y-3 flex-1">
                  {category.items.map((item: any) => (
                    <div 
                      key={item.id} 
                      className={`p-3.5 rounded-xl border transition-all ${
                        selectedModules.includes(item.id)
                          ? 'border-primary/40 bg-primary/[0.03] dark:bg-primary/[0.06] shadow-sm'
                          : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <label className="flex items-start justify-between cursor-pointer gap-3">
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox" 
                            checked={selectedModules.includes(item.id)}
                            onChange={() => toggleModule(item.id)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary dark:bg-black/50 cursor-pointer"
                          />
                          <div>
                            <span className="text-sm font-bold text-slate-800 dark:text-gray-100 block">
                              {item.label}
                            </span>
                            {item.desc && (
                              <span className="text-xs text-slate-500 dark:text-gray-400 mt-1 block leading-relaxed">
                                {item.desc}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="shrink-0 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-bold border border-primary/20">
                          R$ {item.cost.toFixed(2).replace('.', ',')}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={allChecked}
                      onChange={(e) => handleToggleAll(category.items, e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary dark:bg-black/50 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">Marcar todos</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {category.items.filter(i => selectedModules.includes(i.id)).length} de {category.items.length} ativos
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Painel Informativo de Cobertura e Abrangência Nacional */}
      <section className="bg-slate-50/80 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            3. Abrangência e informações retornadas na consulta
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white dark:bg-card/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
              <Scale className="w-4 h-4 text-blue-500" />
              Tribunais Estaduais (TJ)
            </div>
            <p className="text-slate-500 dark:text-gray-400 leading-relaxed">
              Varas Cíveis, Família, Fazenda Pública, Criminais e Juizados Especiais em todos os 27 estados do Brasil (1ª e 2ª Instâncias).
            </p>
          </div>

          <div className="bg-white dark:bg-card/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
              <Landmark className="w-4 h-4 text-purple-500" />
              Justiça Federal & Trabalho
            </div>
            <p className="text-slate-500 dark:text-gray-400 leading-relaxed">
              Tribunais Regionais Federais (TRF1 a TRF6), Execuções Fiscais, Tribunais do Trabalho (TRTs - 24 regiões) e TST.
            </p>
          </div>

          <div className="bg-white dark:bg-card/50 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              Dados do Relatório
            </div>
            <p className="text-slate-500 dark:text-gray-400 leading-relaxed">
              Número CNJ, Vara, Comarca, Assunto, Partes (Polo Ativo / Passivo), Advogados com OAB, Valor da Causa e Andamentos.
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row items-center justify-end gap-6 pt-2">
        {isAdmin && (
          <div className="flex items-center gap-3 bg-white/5 p-2 px-4 rounded-2xl border border-white/5 animate-in fade-in">
            <div className={`p-1.5 rounded-lg ${isDemo ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
              {isDemo ? <FlaskConical className="w-4 h-4" /> : <Search className="w-4 h-4" />}
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
          disabled={loading || !chaveValor || selectedModules.length === 0}
          className={`px-12 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-base shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDemo 
              ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20' 
              : 'btn-premium'
          }`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isDemo ? <FlaskConical className="w-5 h-5" /> : <Search className="w-5 h-5" />)}
          {loading ? 'Consultando...' : (isDemo ? 'Testar Consulta (Grátis)' : `Realizar Consulta (R$ ${totalCost.toFixed(2).replace('.', ',')})`)}
        </button>
      </div>

      {candidates && (
        <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-card shadow-lg mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Selecione o Perfil Correspondente</h2>
              <p className="text-sm text-slate-500 mt-1">O saldo só é debitado após selecionar a pessoa correta.</p>
            </div>
            <button onClick={() => setCandidates(null)} className="text-xs text-red-500 font-bold hover:underline">Cancelar busca</button>
          </div>

          {(() => {
            const itemsPerPage = 10;
            const totalCandidatePages = Math.ceil(candidates.length / itemsPerPage);
            const startIndex = (candidatePage - 1) * itemsPerPage;
            const paginatedCandidates = candidates.slice(startIndex, startIndex + itemsPerPage);

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedCandidates.map((c) => (
                    <div key={c.id} className="border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 p-5 rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-all">
                      <div className="space-y-2 text-sm text-slate-600 dark:text-gray-300">
                        <p className="font-bold text-slate-800 dark:text-white text-base capitalize">{c.name.toLowerCase()}</p>
                        <p><span className="font-semibold text-slate-400">CPF:</span> {c.taxIdNumber || 'Não informado'}</p>
                        <p><span className="font-semibold text-slate-400">Mãe:</span> {c.motherName || 'Não informado'}</p>
                        <p><span className="font-semibold text-slate-400">Localização:</span> {c.city || 'Desconhecida'} - {c.state || 'XX'}</p>
                      </div>
                      <button
                        onClick={() => handleSelectCandidate(c.id)}
                        disabled={loading}
                        className="mt-5 w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        Selecionar e Consultar Processos
                      </button>
                    </div>
                  ))}
                </div>

                {totalCandidatePages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                    <button
                      onClick={() => setCandidatePage(prev => Math.max(prev - 1, 1))}
                      disabled={candidatePage === 1}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-gray-200 transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-sm font-semibold text-slate-500">
                      Página {candidatePage} de {totalCandidatePages} (Total: {candidates.length} perfis)
                    </span>
                    <button
                      onClick={() => setCandidatePage(prev => Math.min(prev + 1, totalCandidatePages))}
                      disabled={candidatePage === totalCandidatePages}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-gray-200 transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {resultado && (
        <div className="mt-8">
          <DataViewer data={resultado} title="Relatório de Processos Judiciais" />
        </div>
      )}
    </div>
  );
}

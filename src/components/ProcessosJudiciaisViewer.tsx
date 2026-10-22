'use client';

import React, { useState } from 'react';
import { 
  Scale, Copy, Check, ShieldCheck, AlertTriangle, FileText, 
  Landmark, UserCheck, Briefcase, Calendar, DollarSign, ChevronDown, ChevronUp, Users
} from 'lucide-react';
import { toast } from 'sonner';

interface Advogado {
  nomeCompleto?: string;
  posicao?: string;
  oab?: {
    numeroOAB?: string;
    uf?: string;
  };
}

interface Parte {
  polo?: string;
  nomeCompleto?: string;
  documento?: string;
  posicaoProcessual?: string;
  advogados?: Advogado[];
}

interface Assunto {
  assunto?: string;
  codigoAssunto?: string | number;
  assuntoPrincipal?: boolean;
}

interface OrgaoJulgador {
  tribunal?: string;
  orgaoResponsavel?: string;
  unidadeOrigem?: string;
  uf?: string;
  comarca?: string;
  cidade?: string;
}

interface ProcessoItem {
  numeroProcesso: string;
  tribunal?: string;
  orgaoJulgador?: OrgaoJulgador | string;
  instancia?: string;
  areaDireito?: string;
  classificacao?: {
    classeProcessual?: string;
    codigoClasse?: string | number;
  } | string;
  sistema?: string;
  assuntos?: Assunto[];
  dataDistribuicao?: string;
  dataAutuacao?: string;
  valorProcesso?: number | string;
  partes?: Parte[];
  detalhesStatusProcesso?: {
    statusDetalhes?: string;
    dataArquivamento?: string | null;
    dataTransitoJulgado?: string | null;
  };
}

interface ProcessosJudiciaisData {
  documentoConsultado?: string;
  totalProcessos?: number;
  observacoes?: string;
  aviso?: string;
  processos?: ProcessoItem[];
}

interface ProcessosJudiciaisViewerProps {
  data: ProcessosJudiciaisData;
}

// Formata número de processo para o padrão nacional CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
function formatCNJ(numero: string | number): string {
  if (!numero) return '';
  const clean = String(numero).replace(/\D/g, '');
  if (clean.length === 20) {
    return clean.replace(/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})$/, '$1-$2.$3.$4.$5.$6');
  }
  return String(numero);
}

// Formata CPF ou CNPJ com máscara
function formatDocumento(doc?: string): string {
  if (!doc) return '';
  const clean = String(doc).replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  if (clean.length === 14) {
    return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  return doc;
}

// Formata valores monetários em BRL
function formatMoeda(valor?: number | string): string {
  const num = Number(valor);
  if (valor === undefined || valor === null || isNaN(num) || num === 0) {
    return 'Sem valor atribuído';
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

// Formata data ISO para pt-BR
function formatData(dataStr?: string | null): string {
  if (!dataStr) return 'Não informada';
  try {
    const d = new Date(dataStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    }
  } catch {}
  return String(dataStr);
}

// Determina estilo do badge de status
function getStatusBadgeClass(status?: string): string {
  const s = (status || '').toLowerCase();
  if (s.includes('andamento') || s.includes('tramit') || s.includes('ativo')) {
    return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  }
  if (s.includes('arquiv') || s.includes('baix') || s.includes('extinto')) {
    return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  }
  if (s.includes('julgado') || s.includes('transitado') || s.includes('finalizado')) {
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }
  if (s.includes('suspens')) {
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  }
  return 'bg-primary/15 text-primary border-primary/30';
}

export function ProcessosJudiciaisViewer({ data }: ProcessosJudiciaisViewerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedProcessos, setExpandedProcessos] = useState<Record<string, boolean>>({});

  const cleanDocConsultado = String(data?.documentoConsultado || '').replace(/\D/g, '');
  const processosList = Array.isArray(data?.processos) ? data.processos : [];
  const total = typeof data?.totalProcessos === 'number' ? data.totalProcessos : processosList.length;

  const handleCopy = (numeroCNJ: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(numeroCNJ);
      setCopiedId(id);
      toast.success('Número do processo copiado para a área de transferência!');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedProcessos(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
  };

  // 1. Cenário de "Nada Consta" ou nenhum processo
  if (total === 0 || processosList.length === 0) {
    return (
      <div className="bg-[#0f172a] rounded-2xl border border-white/5 shadow-xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="p-2.5 bg-primary/20 text-primary rounded-xl shadow-[0_0_12px_rgba(79,70,229,0.2)]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm sm:text-base uppercase tracking-wider">
              Processos Judiciais
            </h3>
            <span className="text-xs text-slate-400">Varas Cíveis, Família, Criminais, Fazenda e Federais</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center sm:text-left">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-emerald-400 font-bold text-sm sm:text-base">
              Nada Consta nos Registros Judiciais
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {data?.aviso || 'Nenhum processo judicial ativo ou arquivado foi localizado para este documento na base de dados dos tribunais estaduais, federais ou do trabalho pesquisados.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Cenário com Processos Encontrados
  return (
    <div className="bg-[#0f172a] rounded-2xl border border-white/5 shadow-2xl p-4 sm:p-6 space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/20 text-primary rounded-xl shadow-[0_0_12px_rgba(79,70,229,0.2)]">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base uppercase tracking-wider">
                Processos Judiciais
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                {total} {total === 1 ? 'Processo Localizado' : 'Processos Localizados'}
              </span>
            </div>
            <span className="text-xs text-slate-400">Tribunais de Justiça, TRFs, TRTs e Juizados Especiais</span>
          </div>
        </div>

        {cleanDocConsultado && (
          <div className="text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 self-start sm:self-auto">
            Doc. Consultado: <span className="text-white font-mono font-medium">{formatDocumento(cleanDocConsultado)}</span>
          </div>
        )}
      </div>

      {/* Caixa de Alerta/Observações Gerais */}
      {data.observacoes && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-amber-300">Observação do Relatório: </strong>
            {data.observacoes}
          </div>
        </div>
      )}

      {/* Lista de Processos */}
      <div className="space-y-5">
        {processosList.map((proc, index) => {
          const rawNumero = proc.numeroProcesso || `processo_${index}`;
          const formattedCNJ = formatCNJ(proc.numeroProcesso);
          const isCopied = copiedId === rawNumero;
          const isExpanded = expandedProcessos[rawNumero] !== false; // Default aberto

          // Órgão julgador pode ser string ou objeto estruturado
          const orgaoObj = typeof proc.orgaoJulgador === 'object' && proc.orgaoJulgador !== null 
            ? proc.orgaoJulgador 
            : null;
          const orgaoText = typeof proc.orgaoJulgador === 'string' 
            ? proc.orgaoJulgador 
            : [orgaoObj?.orgaoResponsavel, orgaoObj?.unidadeOrigem].filter(Boolean).join(' • ');

          const comarcaText = orgaoObj 
            ? [orgaoObj.comarca || orgaoObj.cidade, orgaoObj.uf].filter(Boolean).join(' - ') 
            : null;

          // Classe processual
          const classeText = typeof proc.classificacao === 'object' && proc.classificacao !== null
            ? proc.classificacao.classeProcessual
            : (typeof proc.classificacao === 'string' ? proc.classificacao : null);

          // Status detalhado
          const statusText = proc.detalhesStatusProcesso?.statusDetalhes || 'Em Andamento';

          // Separação de partes em Polo Ativo e Passivo
          const partesAtivo = (proc.partes || []).filter(p => (p.polo || '').toLowerCase().includes('ativo'));
          const partesPassivo = (proc.partes || []).filter(p => (p.polo || '').toLowerCase().includes('passivo'));
          const outrasPartes = (proc.partes || []).filter(p => {
            const polo = (p.polo || '').toLowerCase();
            return !polo.includes('ativo') && !polo.includes('passivo');
          });

          return (
            <div 
              key={rawNumero}
              className="bg-slate-900/90 rounded-xl border border-white/10 shadow-lg overflow-hidden transition-all duration-200 hover:border-primary/40"
            >
              {/* Topo do Card: CNJ, Badges e Botão Copiar */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-white/[0.04] to-transparent border-b border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-primary" />
                      Processo Nº (CNJ)
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-mono font-bold text-white tracking-wide">
                        {formattedCNJ || 'Número não informado'}
                      </span>
                      {formattedCNJ && (
                        <button
                          type="button"
                          onClick={() => handleCopy(formattedCNJ, rawNumero)}
                          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                          title="Copiar número do processo"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Badges de Status, Tribunal e Instância */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusBadgeClass(statusText)}`}>
                      {statusText}
                    </span>
                    {proc.tribunal && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
                        {proc.tribunal}
                      </span>
                    )}
                    {proc.instancia && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-slate-400 border border-white/10">
                        {proc.instancia}
                      </span>
                    )}
                    {proc.sistema && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
                        {proc.sistema}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleExpand(rawNumero)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors sm:hidden ml-auto"
                      aria-label="Expandir detalhes"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sub-faixa de Assuntos e Área */}
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                  {proc.areaDireito && (
                    <span className="text-primary font-semibold">
                      {proc.areaDireito}
                    </span>
                  )}
                  {proc.areaDireito && classeText && <span className="text-slate-600">•</span>}
                  {classeText && (
                    <span className="text-slate-300">
                      {classeText}
                    </span>
                  )}
                  {proc.assuntos && proc.assuntos.length > 0 && (
                    <>
                      <span className="text-slate-600">•</span>
                      {proc.assuntos.map((as, aIdx) => (
                        <span 
                          key={aIdx} 
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            as.assuntoPrincipal 
                              ? 'bg-primary/20 text-primary font-bold border border-primary/30' 
                              : 'bg-white/5 text-slate-400 border border-white/5'
                          }`}
                        >
                          {as.assunto}
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Corpo do Processo (visível sempre ou retrátil no mobile se desejar) */}
              {isExpanded && (
                <div className="p-4 sm:p-5 space-y-6">
                  {/* Grid de Metadados Principais */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-black/30 p-4 rounded-xl border border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Órgão Julgador
                      </span>
                      <span className="text-white font-medium leading-relaxed block">
                        {orgaoText || 'Não informado'}
                      </span>
                      {comarcaText && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {comarcaText}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Data de Distribuição
                      </span>
                      <span className="text-white font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {formatData(proc.dataDistribuicao || proc.dataAutuacao)}
                      </span>
                      {proc.dataAutuacao && proc.dataAutuacao !== proc.dataDistribuicao && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Autuação: {formatData(proc.dataAutuacao)}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Valor da Causa
                      </span>
                      <span className="text-white font-medium flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        {formatMoeda(proc.valorProcesso)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Status & Trânsito
                      </span>
                      <span className="text-white font-medium block">
                        {statusText}
                      </span>
                      {proc.detalhesStatusProcesso?.dataTransitoJulgado && (
                        <span className="text-[10px] text-emerald-400 block mt-0.5">
                          Trânsito: {formatData(proc.detalhesStatusProcesso.dataTransitoJulgado)}
                        </span>
                      )}
                      {proc.detalhesStatusProcesso?.dataArquivamento && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Arquivamento: {formatData(proc.detalhesStatusProcesso.dataArquivamento)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Partes do Processo */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <Users className="w-4 h-4 text-primary" />
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                        Partes e Representantes Processuais
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Polo Passivo (Réus, Executados, Apelantes) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                          <span>Polo Passivo (Réu / Executado / Apelante)</span>
                          <span>{partesPassivo.length}</span>
                        </div>

                        {partesPassivo.length === 0 ? (
                          <span className="text-slate-500 italic text-xs block px-2">Nenhum dado informado</span>
                        ) : (
                          <div className="space-y-2">
                            {partesPassivo.map((parte, pIdx) => (
                              <ParteCard 
                                key={pIdx} 
                                parte={parte} 
                                cleanDocConsultado={cleanDocConsultado} 
                                poloType="passivo"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Polo Ativo (Autores, Exequentes, Apelados) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-blue-400/90 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                          <span>Polo Ativo (Autor / Exequente / Apelado)</span>
                          <span>{partesAtivo.length}</span>
                        </div>

                        {partesAtivo.length === 0 ? (
                          <span className="text-slate-500 italic text-xs block px-2">Nenhum dado informado</span>
                        ) : (
                          <div className="space-y-2">
                            {partesAtivo.map((parte, pIdx) => (
                              <ParteCard 
                                key={pIdx} 
                                parte={parte} 
                                cleanDocConsultado={cleanDocConsultado} 
                                poloType="ativo"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Outras Partes / Terceiros */}
                    {outrasPartes.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          <span>Outros Envolvidos / Terceiros</span>
                          <span>{outrasPartes.length}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {outrasPartes.map((parte, pIdx) => (
                            <ParteCard 
                              key={pIdx} 
                              parte={parte} 
                              cleanDocConsultado={cleanDocConsultado} 
                              poloType="outros"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Subcomponente individual de cada Parte envolvida
function ParteCard({ 
  parte, 
  cleanDocConsultado,
  poloType 
}: { 
  parte: Parte; 
  cleanDocConsultado: string;
  poloType: 'ativo' | 'passivo' | 'outros';
}) {
  const cleanParteDoc = String(parte.documento || '').replace(/\D/g, '');
  const isConsultedPerson = Boolean(cleanDocConsultado && cleanParteDoc && cleanDocConsultado === cleanParteDoc);

  return (
    <div className={`p-3 rounded-lg border text-xs space-y-2 ${
      isConsultedPerson 
        ? 'bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(79,70,229,0.15)]' 
        : 'bg-black/20 border-white/5'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white uppercase text-xs">
              {parte.nomeCompleto || 'Nome não informado'}
            </span>
            {isConsultedPerson && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary text-white shadow-sm flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                Pessoa Consultada
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            {parte.documento && (
              <span>Doc: <strong className="text-slate-300 font-mono">{formatDocumento(parte.documento)}</strong></span>
            )}
            {parte.posicaoProcessual && (
              <>
                <span>•</span>
                <span className="text-slate-300 font-medium">Posição: {parte.posicaoProcessual}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Advogados da Parte */}
      {parte.advogados && parte.advogados.length > 0 && (
        <div className="pt-2 border-t border-white/5 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Briefcase className="w-3 h-3" />
            Advogados / Representantes
          </span>
          {parte.advogados.map((adv, aIdx) => (
            <div key={aIdx} className="bg-white/5 px-2.5 py-1.5 rounded text-[11px] text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-medium text-white">{adv.nomeCompleto || 'Nome não informado'}</span>
              <div className="flex items-center gap-2 text-slate-400">
                {adv.posicao && <span>({adv.posicao})</span>}
                {adv.oab?.numeroOAB && (
                  <span className="font-mono text-primary font-semibold">
                    OAB/{adv.oab.uf || 'BR'} {adv.oab.numeroOAB}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

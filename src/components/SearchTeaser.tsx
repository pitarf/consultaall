'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle, UserPlus, LogIn, X } from 'lucide-react';
import Link from 'next/link';

/**
 * Componente de Isca de Conversão (Search Teaser)
 * Simula uma consulta para qualquer dado digitado pelo visitante,
 * exibe uma animação de "Consultando..." e depois mostra
 * "Resultado disponível!" para incentivar o cadastro.
 */
export default function SearchTeaser() {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<'idle' | 'loading' | 'result'>('idle');

  /**
   * Inicia a simulação de busca.
   * Não faz nenhuma chamada real de API.
   */
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setStage('loading');

    // Simula o tempo de "consulta" entre 2.5 e 3.5 segundos
    const delay = 2500 + Math.random() * 1000;
    setTimeout(() => {
      setStage('result');
    }, delay);
  }

  function handleReset() {
    setStage('idle');
    setQuery('');
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* ===== Campo de Busca ===== */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um CPF, nome, telefone, e-mail..."
            className="w-full bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/60 focus:bg-white/10 transition-all text-base"
            disabled={stage !== 'idle'}
          />
        </div>
        <button
          type="submit"
          disabled={stage !== 'idle' || !query.trim()}
          className="btn-premium px-6 py-4 rounded-2xl flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-5 h-5" />
          Pesquisar
        </button>
      </form>

      <p className="text-gray-600 text-xs mt-2 ml-1">
        * Faça login para visualizar os resultados completos
      </p>

      {/* ===== MODAL OVERLAY ===== */}
      {stage !== 'idle' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={stage === 'result' ? handleReset : undefined}
        >
          {/* ===== LOADING ===== */}
          {stage === 'loading' && (
            <div className="glass-panel rounded-3xl p-10 flex flex-col items-center gap-5 max-w-sm w-full mx-4 border border-white/15 shadow-2xl animate-fade-in">
              {/* Spinner com anel duplo */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-blue-400/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white mb-2">Consultando...</p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Aguarde enquanto buscamos os dados<br />solicitados em nossa base.
                </p>
              </div>
              {/* Barra de progresso animada */}
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full animate-progress" />
              </div>
            </div>
          )}

          {/* ===== RESULTADO DISPONÍVEL ===== */}
          {stage === 'result' && (
            <div
              className="glass-panel rounded-3xl p-8 flex flex-col items-center gap-6 max-w-sm w-full mx-4 border border-green-500/20 shadow-2xl shadow-green-500/10 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ícone de sucesso */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                {/* Pulso animado */}
                <div className="absolute inset-0 rounded-full border-2 border-green-400/30 animate-ping" />
              </div>

              <div className="text-center">
                <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-3">
                  Resultado disponível!
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Para visualizar os detalhes completos,<br />
                  faça login ou cadastre-se agora.
                </p>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link
                  href="/cadastro"
                  className="flex-1 btn-premium py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <UserPlus className="w-4 h-4" />
                  Cadastre-se
                </Link>
                <Link
                  href="/login"
                  className="flex-1 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-semibold text-gray-300"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </div>

              {/* Fechar */}
              <button
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1 text-xs"
              >
                <X className="w-3 h-3" />
                Fazer outra busca
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

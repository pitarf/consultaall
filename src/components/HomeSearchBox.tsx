'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function HomeSearchBox() {
  const [type, setType] = useState<'cpf' | 'placa' | 'telefone'>('cpf');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const steps = [
    'Conectando ao banco de dados...',
    'Consultando indexadores da Receita Federal...',
    'Filtrando informações públicas registradas...',
    'Gerando relatório de preview...'
  ];

  const formatCPF = (v: string) => {
    v = v.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    return v
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatTelefone = (v: string) => {
    v = v.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    
    if (v.length <= 2) return v;
    if (v.length <= 6) return v.replace(/(\d{2})(\d)/, '$1 $2');
    if (v.length <= 10) {
      return v
        .replace(/(\d{2})(\d)/, '$1 $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return v
      .replace(/(\d{2})(\d)/, '$1 $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    let rawVal = e.target.value;

    if (type === 'cpf') {
      setValue(formatCPF(rawVal));
    } else if (type === 'telefone') {
      setValue(formatTelefone(rawVal));
    } else if (type === 'placa') {
      rawVal = rawVal.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      if (rawVal.length > 8) rawVal = rawVal.slice(0, 8);
      if (rawVal.length === 7 && !rawVal.includes('-')) {
        const isOldPattern = /^[A-Z]{3}[0-9]{4}$/.test(rawVal);
        if (isOldPattern) {
          rawVal = rawVal.replace(/^([A-Z]{3})([0-9]{4})$/, '$1-$2');
        }
      }
      setValue(rawVal);
    }
  };

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev >= steps.length - 1) {
            clearInterval(interval);
            setLoading(false);
            setShowResult(true);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanVal = value.replace(/\D/g, '');

    if (type === 'cpf') {
      if (cleanVal.length !== 11) {
        setError('Insira um CPF válido.');
        return;
      }

      // CPFs inválidos conhecidos
      const invalidCpfs = [
        '00000000000', '11111111111', '22222222222', '33333333333', 
        '44444444444', '55555555555', '66666666666', '77777777777', 
        '88888888888', '99999999999', '12345678909', '12345678910',
        '12345678911'
      ];
      if (invalidCpfs.includes(cleanVal)) {
        setError('Insira um CPF válido.');
        return;
      }
    } else if (type === 'telefone') {
      if (cleanVal.length !== 10 && cleanVal.length !== 11) {
        setError('Insira um Telefone válido.');
        return;
      }

      // Telefones inválidos
      const invalidTelephones = [
        '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
        '5555555555', '6666666666', '7777777777', '8888888888', '9999999999',
        '00000000000', '11111111111', '22222222222', '33333333333', '44444444444',
        '55555555555', '66666666666', '77777777777', '88888888888', '99999999999'
      ];
      if (invalidTelephones.includes(cleanVal)) {
        setError('Insira um Telefone válido.');
        return;
      }
    } else if (type === 'placa') {
      const cleanPlaca = value.replace(/-/g, '').toUpperCase();
      const isPlacaValida = /^[A-Z]{3}[0-9]{4}$/.test(cleanPlaca) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleanPlaca);
      if (!isPlacaValida) {
        setError('Insira uma Placa válida (Ex: ABC1D23 ou ABC-1234).');
        return;
      }
    }

    setLoading(true);
    setShowResult(false);
  };

  const getMaskedResult = () => {
    switch (type) {
      case 'cpf':
        return {
          title: 'Registro de Pessoa Física Encontrado',
          rows: [
            { label: 'Nome Completo', value: 'RODRIGO D******** P*****' },
            { label: 'Data de Nascimento', value: '18/06/198*' },
            { label: 'Nome da Mãe', value: 'MARIA DA S***** P*****' },
            { label: 'Situação CPF', value: 'REGULAR (ATIVO)' }
          ]
        };
      case 'placa':
        return {
          title: 'Registro de Veículo Encontrado',
          rows: [
            { label: 'Marca / Modelo', value: 'FIAT / UNO MIL* ***' },
            { label: 'Ano de Fabricação', value: '2012 / 2013' },
            { label: 'Proprietário Atual', value: 'ROB***** S***** DE O*****' },
            { label: 'UF Licenciamento', value: 'SP (São Paulo)' }
          ]
        };
      case 'telefone':
        return {
          title: 'Vínculo Telefônico Encontrado',
          rows: [
            { label: 'Proprietário provável', value: 'JULIANA C***** G*****' },
            { label: 'Operadora', value: 'CLARO (MÓVEL)' },
            { label: 'Região', value: 'DDD 11 (São Paulo)' },
            { label: 'Situação da Linha', value: 'ATIVA' }
          ]
        };
    }
  };

  const currentResult = getMaskedResult();

  return (
    <div className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xl max-w-xl mx-auto">
      {/* Tabs */}
      <div className="flex bg-slate-200/60 p-1.5 rounded-2xl mb-6 gap-2">
        {(['cpf', 'placa', 'telefone'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              setValue('');
              setError(null);
              setShowResult(false);
            }}
            className={`flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all capitalize ${
              type === t
                ? 'bg-[#2872fa] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'telefone' ? 'Telefone' : t === 'cpf' ? 'CPF' : 'Placa'}
          </button>
        ))}
      </div>

      {!loading && !showResult && (
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder={
                type === 'cpf'
                  ? 'Digite o CPF (Ex: 000.000.000-00)'
                  : type === 'placa'
                  ? 'Digite a Placa (Ex: ABC1D23)'
                  : 'Digite o Telefone com DDD (Ex: 11 99999-9999)'
              }
              className="w-full bg-white border border-slate-200 rounded-2xl pl-5 pr-16 py-4 text-slate-900 focus:border-[#2872fa] focus:ring-2 focus:ring-[#2872fa]/10 outline-none transition-all text-sm font-semibold"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="absolute right-2 top-2 bottom-2 px-5 bg-[#2872fa] hover:bg-[#1a5ecd] text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-500/10 p-3.5 rounded-2xl border border-red-200 dark:border-red-500/20 animate-in fade-in slide-in-from-top-1 duration-200">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 font-semibold text-center uppercase tracking-wider">
            Digite o dado cadastral acima para testar a busca
          </p>
        </form>
      )}

      {loading && (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#2872fa] animate-spin" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-700">{steps[loadingStep]}</p>
            <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-[#2872fa] transition-all duration-700" 
                style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {showResult && (
        <div className="space-y-6 animate-in fade-in duration-500 text-left">
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-800">Resultado Encontrado!</h4>
              <p className="text-xs text-emerald-600 font-medium">As bases retornaram o relatório de preview mascarado abaixo.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3 shadow-xs">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">
              {currentResult.title}
            </h5>
            {currentResult.rows.map((row, idx) => (
              <div key={idx} className="flex justify-between text-xs py-1">
                <span className="text-slate-500 font-medium">{row.label}:</span>
                <span className="font-mono font-bold text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Link
              href="/cadastro"
              className="w-full bg-[#2872fa] hover:bg-[#1a5ecd] text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-[#2872fa]/20 flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wider"
            >
              Revelar Relatório Completo
            </Link>
            <button
              onClick={() => {
                setValue('');
                setShowResult(false);
              }}
              className="w-full text-xs text-slate-400 hover:text-slate-600 font-semibold text-center hover:underline"
            >
              Realizar outra busca de teste
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import NavbarClient from '@/components/NavbarClient';
import { registrarOptOut } from '@/app/actions/optout';
import { 
  ShieldAlert, 
  User, 
  Fingerprint, 
  Mail, 
  FileQuestion, 
  CheckCircle2, 
  ArrowLeft,
  Search
} from 'lucide-react';

/**
 * Página Pública de Proteção de Dados e Opt-out LGPD
 * Permite que titulares de dados solicitem o bloqueio da exibição de seus CPFs nas buscas.
 * Essencial para conformidade com a LGPD e Whitelisting no Google Ads.
 */
export default function ProtecaoDeDados() {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('Privacidade e segurança pessoal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Aplica máscara de CPF de forma reativa (999.999.999-99)
  function handleCpfChange(val: string) {
    const clean = val.replace(/\D/g, '');
    let formatted = clean;
    if (clean.length > 3) formatted = `${clean.slice(0, 3)}.${clean.slice(3)}`;
    if (clean.length > 6) formatted = `${formatted.slice(0, 7)}.${formatted.slice(7)}`;
    if (clean.length > 9) formatted = `${formatted.slice(0, 11)}-${formatted.slice(11, 13)}`;
    setCpf(formatted.slice(0, 14));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !cpf.trim() || !email.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      /* 
      =========================================================================
      [INTEGRAÇÃO PRODUÇÃO COMENTADA - ATIVE QUANDO O DONO CONTRATAR O SERVIÇO]
      Para ativar a gravação automática na tabela de auditoria SystemLog e banco de dados,
      basta descomentar o bloco abaixo e remover o bloco de simulação simulada.
      =========================================================================
      
      const res = await registrarOptOut({ name, cpf, email, reason });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsSuccess(true);
      }
      */

      // =========================================================================
      // [MODO DE DEMONSTRAÇÃO / HOMOLOGAÇÃO PARA VENDA]
      // Simula o comportamento real do servidor de forma assíncrona.
      // =========================================================================
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success('Solicitação de Opt-out simulada com sucesso! (Modo Demonstração)');
      setIsSuccess(true);

    } catch (err) {
      toast.error('Ocorreu uma instabilidade. Tente novamente em instantes.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-x-hidden">
      
      {/* ===================== NAVBAR ===================== */}
      <NavbarClient />

      {/* ===================== CONTEÚDO PRINCIPAL ===================== */}
      <main className="flex-1 py-16 md:py-24 flex items-center justify-center">
        <div className="max-w-xl mx-auto px-4 sm:px-6 w-full text-center">
          
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-10 shadow-xl space-y-6 relative overflow-hidden">
            {/* Elemento de brilho sutil */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
            
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-3">
              <span className="text-[#2872fa] text-[10px] font-bold uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full">
                Módulo LGPD sob demanda
              </span>
              <h1 className="text-2xl font-extrabold text-[#243b56] tracking-tight">
                Canal de Proteção de Dados (Opt-out)
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Este canal está atualmente em <strong>modo de homologação e desenvolvimento técnico</strong> para a plataforma <strong>Detetive Buscas</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#f8fafc] border border-slate-100 rounded-2xl text-xs text-slate-500 leading-relaxed text-left">
              <strong>Nota técnica:</strong> Se você é o proprietário da plataforma, entre em contato para ativar a licença do canal LGPD e habilitar a conformidade jurídica integral em produção.
            </div>

            <div className="pt-2">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-sm font-bold text-[#2872fa] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para a Página Inicial
              </Link>
            </div>
          </div>

          {/* 
          =============================================================================
          [CÓDIGO DE PROTEÇÃO DE DADOS COMPLETO - TOTALMENTE COMENTADO PARA VENDA]
          Para reativar a tela do formulário real e a Server Action de Opt-out, 
          basta remover os delimitadores de comentário HTML abaixo e ocultar o bloco acima.
          =============================================================================
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mt-8">
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/50 flex items-center justify-center text-[#2872fa]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#243b56] tracking-tight">
                Canal de Proteção de Dados (Opt-out)
              </h1>
              <p className="text-slate-600 text-sm leading-relaxed">
                Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/18), a Detetive Buscas garante o direito de oposição e privacidade aos titulares de dados pessoais.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Ao preencher este formulário, você solicita formalmente o bloqueio da visualização dos dados cadastrais associados ao seu CPF em nosso painel de buscas internas de forma definitiva e gratuita.
              </p>
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] text-slate-500 leading-relaxed">
                <strong>Nota de conformidade:</strong> As informações preenchidas ao lado serão utilizadas de forma exclusiva e estritamente restrita para efetivar o bloqueio técnico do CPF indicado, não sendo armazenadas para outros fins comerciais.
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-[#e2e8f0] rounded-3xl p-8 shadow-sm">
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <span className="text-lg mt-0.5">⚠️</span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Módulo LGPD / Homologação Técnica</h4>
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        Este canal de oposição cadastral está operando em <strong>Modo Demonstração</strong>. As solicitações preenchidas simularão o fluxo de sucesso completo, mas não serão gravadas no banco até a ativação definitiva.
                      </p>
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h2 className="text-lg font-bold text-[#243b56]">Formulário de Solicitação</h2>
                    <p className="text-xs text-slate-400">Preencha com seus dados oficiais para comprovação do titular.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Carlos Henrique da Silva"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#2872fa] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">CPF do Titular</label>
                      <div className="relative">
                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input 
                          type="text" 
                          required
                          value={cpf}
                          onChange={(e) => handleCpfChange(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#2872fa] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">E-mail de Contato</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="carlos@exemplo.com.br"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#2872fa] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Motivo do Bloqueio</label>
                    <div className="relative">
                      <FileQuestion className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 text-sm focus:outline-none focus:border-[#2872fa] focus:bg-white transition-colors appearance-none"
                      >
                        <option value="Privacidade e segurança pessoal">Privacidade e segurança pessoal</option>
                        <option value="Discordância com a exibição de dados">Discordância com a exibição de dados</option>
                        <option value="Solicitação jurídica/Conformidade LGPD">Solicitação jurídica / Conformidade LGPD</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input 
                      type="checkbox" 
                      required 
                      id="consent"
                      className="w-4 h-4 rounded border-slate-300 text-[#2872fa] focus:ring-[#2872fa] mt-1 cursor-pointer"
                    />
                    <label htmlFor="consent" className="text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                      Declaro que sou o legítimo titular do CPF informado acima (ou representante legal) e autorizo o processamento destes dados exclusivamente para efetivação do bloqueio cadastral.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#2872fa] hover:bg-[#1a5ecd] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#2872fa]/10 transition-all active:scale-98 text-sm"
                  >
                    {isSubmitting ? 'Registrando Solicitação...' : 'Confirmar e Solicitar Bloqueio'}
                  </button>
                </form>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-5 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-md">
                    <CheckCircle2 className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-extrabold text-[#243b56]">Solicitação Concluída!</h2>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                      Sua solicitação de opt-out para o CPF <strong>{cpf}</strong> foi gravada em nosso sistema com sucesso para verificação interna.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-400 max-w-sm">
                    Um e-mail de notificação de recebimento foi disparado para <strong>{email}</strong>. O prazo regulamentar para efetivação definitiva na base é de até 48 horas comerciais.
                  </div>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setName('');
                      setCpf('');
                      setEmail('');
                    }}
                    className="text-[#2872fa] hover:underline text-xs font-bold"
                  >
                    Registrar outra solicitação
                  </button>
                </div>
              )}
            </div>
          </div>
          */}
        </div>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-[#1c2639] text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#2872fa] flex items-center justify-center shadow-md">
                <Search className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Detetive<span className="text-[#2872fa]">Buscas</span>
              </span>
            </div>
            <div className="flex gap-6 text-xs font-semibold">
              <Link href="/" className="hover:text-white transition-colors">Voltar à Home</Link>
              <Link href="/login" className="hover:text-white transition-colors">Acessar Painel</Link>
              <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            </div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Detetive Buscas. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { ArrowLeft, Search, HelpCircle, Mail, MessageSquare, AlertTriangle } from "lucide-react";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function SuportePage() {
  const settings = await prisma.systemSetting.findFirst();
  const siteTitle = settings?.siteTitle?.split(' - ')[0] || "Detetive Buscas";
  const companyEmail = settings?.companyEmail || "suporte@detetivebuscas.com";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased overflow-x-hidden">
      {/* Header Simplificado */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2872fa] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Home
          </Link>

          <div className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo do Detetive Buscas" className="h-7 w-auto object-contain" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-[#2872fa] flex items-center justify-center shadow-md shadow-[#2872fa]/20">
                <Search className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-lg font-bold text-[#243b56] hidden sm:block">
              Detetive<span className="text-[#2872fa]">Buscas</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/50 text-[#2872fa] text-xs font-semibold mb-6">
              <HelpCircle className="w-3.5 h-3.5" />
              Central de Ajuda
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight mb-6">
              Suporte Técnico B2B
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
              Selecione o canal adequado para resolver problemas com recargas, suporte operacional ou dúvidas técnicas.
            </p>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-8 md:p-12 shadow-sm text-left space-y-12">
            
            {/* Como funciona o suporte */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                <MessageSquare className="w-6 h-6" />
                <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">Como funciona nosso suporte?</h2>
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Nossos clientes corporativos dispõem de suporte técnico direto. Para agilizar o atendimento de qualquer ocorrência, pedimos que envie sua mensagem detalhando o ocorrido e contendo as credenciais básicas do seu cadastro.
              </p>
            </section>

            {/* SLA e Prazos */}
            <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-[#243b56] text-sm">Prazos de Atendimento e SLA</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] uppercase font-bold tracking-tighter text-slate-500 text-center">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">Severidade 1: 6h Úteis</div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">Severidade 2: 10h Úteis</div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">Severidade 3: 2 Dias</div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">Severidade 4: 3 Dias</div>
              </div>
            </section>

            {/* Canal de Atendimento */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                <Mail className="w-6 h-6" />
                <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">Abrir Chamado</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Para suporte comercial, financeiro ou técnico, envie um e-mail para: <span className="text-[#243b56] font-bold">{companyEmail}</span>.
              </p>
            </section>

            {/* Aviso sobre segurança */}
            <section className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4 items-start">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-bold text-amber-800 text-sm">Aviso de Segurança Importante</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  O suporte do Detetive Buscas jamais solicitará a sua senha do painel, chaves de API, credenciais bancárias ou códigos de segurança recebidos via SMS. Mantenha seus acessos protegidos de forma segura.
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Footer Simplificado */}
      <footer className="py-12 border-t border-slate-200 bg-white text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs md:text-sm">
            © {new Date().getFullYear()} {siteTitle}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

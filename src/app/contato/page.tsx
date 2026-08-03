import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { ArrowLeft, Search, Mail, MapPin, Clock, MessageSquare } from "lucide-react";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function ContatoPage() {
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
              <MessageSquare className="w-3.5 h-3.5" />
              Canais Oficiais
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight mb-6">
              Fale Conosco
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
              Precisa de ajuda com o seu saldo, dúvidas sobre os módulos ou deseja fechar uma parceria comercial? Entre em contato por um de nossos canais oficiais abaixo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informações de Contato */}
            <div className="bg-white border border-[#e2e8f0] rounded-3xl p-8 shadow-sm space-y-8 text-left">
              <h2 className="text-xl font-bold text-[#243b56] border-b pb-3 mb-6">Dados de Contato</h2>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2872fa] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">E-mail de Suporte</h3>
                  <p className="text-slate-500 text-sm mt-1">{companyEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2872fa] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Horário de Atendimento</h3>
                  <p className="text-slate-500 text-sm mt-1">Segunda a Sexta-feira • 09:00 às 18:00 (Horário de Brasília)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2872fa] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Localização</h3>
                  <p className="text-slate-500 text-sm mt-1">São Paulo, Brasil • Atendimento 100% Digital</p>
                </div>
              </div>
            </div>

            {/* Mensagem Importante */}
            <div className="bg-[#2872fa]/5 border border-[#2872fa]/20 rounded-3xl p-8 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#243b56]">Suporte Rápido e Seguro</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Para agilizar o atendimento de dúvidas sobre recargas, tenha em mãos o comprovante de pagamento via Pix ou o ID do usuário cadastrado na plataforma.
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  O prazo médio de resposta para solicitações via e-mail é de até 24 horas úteis.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-200/50 mt-6">
                <Link
                  href="/login"
                  className="w-full bg-[#2872fa] hover:bg-[#1a5ecd] text-white font-bold py-3.5 px-4 rounded-xl text-center text-sm block shadow-md shadow-[#2872fa]/10 transition-all active:scale-95"
                >
                  Ir para Painel Logado
                </Link>
              </div>
            </div>
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

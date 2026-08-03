import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { ArrowLeft, Search, Shield, Lock, Eye, Scale } from "lucide-react";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function PrivacidadePage() {
  const settings = await prisma.systemSetting.findFirst();
  const siteTitle = settings?.siteTitle?.split(' - ')[0] || "Detetive Buscas";

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
              <Shield className="w-3.5 h-3.5" />
              LGPD & Privacidade
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight mb-6">
              Política de Privacidade
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-8 md:p-12 shadow-sm text-left">
            <div className="space-y-12 text-slate-600">
              
              {/* Seção 1 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                  <Scale className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">1. Compromisso com a Privacidade</h2>
                </div>
                <p className="text-sm md:text-base leading-relaxed">
                  O {siteTitle} valoriza a privacidade e a segurança das informações tratadas em sua plataforma. Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos as informações fornecidas por nossos usuários, bem como os dados tratados em nossas ferramentas de consulta de conformidade cadastral, em total respeito à Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/18).
                </p>
              </section>

              {/* Seção 2 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                  <Lock className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">2. Tratamento e Segurança de Dados</h2>
                </div>
                <p className="text-sm md:text-base leading-relaxed">
                  Todos os dados pessoais de cadastro dos usuários da nossa plataforma (como e-mail, nome e dados de faturamento) são armazenados em servidores seguros e criptografados. Nós não compartilhamos as pesquisas realizadas por nossos usuários com terceiros, mantendo sigilo absoluto sobre o histórico de consultas de cada conta cadastrada.
                </p>
              </section>

              {/* Seção 3 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                  <Eye className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">3. Direitos dos Titulares de Dados</h2>
                </div>
                <p className="text-sm md:text-base leading-relaxed">
                  Em conformidade com as diretrizes da LGPD, garantimos aos titulares de dados pessoais o pleno exercício de seus direitos. Caso você queira solicitar a oposição, bloqueio ou exclusão da visualização do seu CPF em nossas ferramentas de busca de conformidade, disponibilizamos um canal público e gratuito de Opt-out através da nossa página de <Link href="/protecao-de-dados" className="text-[#2872fa] hover:underline font-semibold">Proteção de Dados</Link>.
                </p>
              </section>

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

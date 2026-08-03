import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { ArrowLeft, Search, Shield, Users, Target, Compass } from "lucide-react";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function SobrePage() {
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
              Institucional
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight mb-6">
              Sobre o <br className="hidden sm:block" />
              <span className="text-[#2872fa]">Detetive Buscas</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto">
              Conheça nossa trajetória, nosso propósito corporativo e como estruturamos a maior plataforma de enriquecimento cadastral do país.
            </p>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-8 md:p-12 shadow-sm text-left space-y-12">
            
            {/* Quem Somos */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                <Users className="w-6 h-6" />
                <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">Quem Somos</h2>
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                O Detetive Buscas é uma plataforma tecnológica de ponta dedicada ao enriquecimento de dados cadastrais e à facilitação de consultas institucionais. Voltada estritamente para o ambiente de negócios (B2B), a plataforma ajuda empresas na prevenção de fraudes, validação de identidades (KYC - Know Your Customer) e higienização de registros internos.
              </p>
            </section>

            {/* Nossa Missão */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                <Target className="w-6 h-6" />
                <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">Nossa Missão</h2>
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Nossa missão é democratizar o acesso à inteligência cadastral de forma transparente e flexível. Por meio do modelo pay-per-use, permitimos que negócios de qualquer porte tenham acesso a dados valiosos sem a necessidade de contratos engessados de fidelidade ou taxas fixas mensais.
              </p>
            </section>

            {/* Nossos Valores */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                <Compass className="w-6 h-6" />
                <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">Nossos Valores</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-2xl">
                  <h3 className="font-bold text-[#243b56] text-sm mb-2">Transparência</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">Preços claros, sem taxas escondidas ou mensalidades fixas.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-2xl">
                  <h3 className="font-bold text-[#243b56] text-sm mb-2">Privacidade</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">Conformidade total com a LGPD e respeito aos direitos dos titulares.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/50 p-5 rounded-2xl">
                  <h3 className="font-bold text-[#243b56] text-sm mb-2">Tecnologia</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">Consultas em milissegundos e cache inteligente otimizado.</p>
                </div>
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

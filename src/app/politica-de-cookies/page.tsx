import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { ArrowLeft, Search, Shield, Info, Settings, Eye } from "lucide-react";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CookiesPage() {
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
              Transparência & Cookies
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight mb-6">
              Política de Cookies
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
                  <Info className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">1. O que são Cookies?</h2>
                </div>
                <p className="text-sm md:text-base leading-relaxed">
                  Cookies são pequenos arquivos de texto salvos em seu computador ou dispositivo móvel quando você visita um site. Eles ajudam a plataforma a reconhecer o seu dispositivo, guardar suas preferências de exibição e manter sua sessão ativa de forma segura.
                </p>
              </section>

              {/* Seção 2 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                  <Settings className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">2. Como Utilizamos os Cookies?</h2>
                </div>
                <p className="text-sm md:text-base leading-relaxed">
                  No {siteTitle}, utilizamos cookies estritamente necessários para viabilizar o login seguro na conta do usuário, manter as sessões ativas e registrar a origem do tráfego para fins estatísticos e prevenção de acessos suspeitos. Não utilizamos cookies para rastreamento de comportamento em sites de terceiros ou publicidade direcionada invasiva.
                </p>
              </section>

              {/* Seção 3 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                  <Eye className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">3. Gerenciamento de Preferências</h2>
                </div>
                <p className="text-sm md:text-base leading-relaxed">
                  O usuário pode gerenciar, desativar ou apagar os cookies diretamente nas configurações de privacidade do seu navegador web. Contudo, observe que desativar os cookies estritamente necessários pode impossibilitar a realização do login e a utilização das ferramentas dentro do painel do {siteTitle}.
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

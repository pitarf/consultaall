import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { ArrowLeft, Search, Shield, Lock, Scale, FileText } from "lucide-react";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

/**
 * Página de Termos de Uso e Políticas
 * Conteúdo adaptado para o Detetive Buscas com design premium.
 */
export default async function TermosPage() {
  const settings = await prisma.systemSetting.findFirst();
  const siteTitle = settings?.siteTitle?.split(' - ')[0] || "Detetive Buscas";
  const companyName = settings?.companyName || "NOME DA EMPRESA LTDA";
  const companyCnpj = settings?.companyCnpj || "00.000.000/0001-00";
  const companyAddress = settings?.companyAddress || "Endereço Completo, Cidade - UF";
  const companyEmail = settings?.companyEmail || "contato@seusite.com";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Simplificado */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-50">
        <div className="container-premium py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-all">
              <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-primary" />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Voltar para Home</span>
          </Link>

          <div className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-7 w-auto object-contain" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-lg font-bold text-white hidden sm:block">{siteTitle}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-16 lg:py-24">
        <div className="container-premium max-w-4xl">
          {/* Hero da Página */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-6">
              <Shield className="w-3.5 h-3.5" />
              Transparência e Segurança
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Termos de Uso e <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Políticas de Privacidade</span>
            </h1>
            <p className="text-gray-400">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Conteúdo dos Termos */}
          <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="prose prose-invert max-w-none space-y-12 text-gray-300">
              
              <section>
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <FileText className="w-6 h-6" />
                  <h2 className="text-2xl font-bold m-0 text-white">1. Identificação</h2>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                  <p className="m-0"><span className="text-gray-500 font-bold mr-2 uppercase text-xs">Empresa:</span> <span className="text-white">{companyName}</span></p>
                  <p className="m-0"><span className="text-gray-500 font-bold mr-2 uppercase text-xs">CNPJ:</span> <span className="text-white">{companyCnpj}</span></p>
                  <p className="m-0"><span className="text-gray-500 font-bold mr-2 uppercase text-xs">Endereço:</span> <span className="text-white">{companyAddress}</span></p>
                  <p className="m-0"><span className="text-gray-500 font-bold mr-2 uppercase text-xs">E-mail:</span> <span className="text-white">{companyEmail}</span></p>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <Scale className="w-6 h-6" />
                  <h2 className="text-2xl font-bold m-0 text-white">2. Objeto e Uso do Serviço</h2>
                </div>
                <p className="leading-relaxed">
                  2.1. O escopo do presente termo é a adesão pelo CLIENTE ao conjunto completo de Serviços disponibilizados pelo <strong>{siteTitle}</strong> em seu Portal.
                </p>
                <p className="leading-relaxed">
                  2.2. O CLIENTE selecionará no Portal, de forma unilateral e por livre e espontânea manifestação de vontade, quais serviços disponibilizados irá utilizar, através da configuração de seus acessos e consultas.
                </p>
                <p className="leading-relaxed">
                  2.3. Os Serviços são cobrados conforme a quantidade de consultas realizadas ou pacotes de saldo adquiridos. O saldo adquirido ficará disponível a partir da sua data de aquisição.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <Lock className="w-6 h-6" />
                  <h2 className="text-2xl font-bold m-0 text-white">3. Privacidade e Proteção de Dados (LGPD)</h2>
                </div>
                <p className="leading-relaxed">
                  3.1. O <strong>{siteTitle}</strong> se obriga a estar em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
                </p>
                <p className="leading-relaxed">
                  3.2. É proibido o tratamento dos dados pessoais de pessoas físicas para qualquer fim que não esteja diretamente relacionado a processos de avaliação de crédito, legítimo interesse ou proteção do crédito.
                </p>
                <p className="leading-relaxed">
                  3.3. As partes deverão manter e utilizar medidas de segurança administrativas, técnicas e físicas apropriadas para proteger a confidencialidade e integridade dos dados pessoais.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <Shield className="w-6 h-6" />
                  <h2 className="text-2xl font-bold m-0 text-white">4. Pagamentos e Cancelamentos</h2>
                </div>
                <p className="leading-relaxed">
                  4.1. Considerando que os serviços consistem em consultas e entregas de dados digitais em tempo real, a execução ocorre de forma imediata, razão pela qual <strong>não há possibilidade de cancelamento ou estorno</strong> após a efetiva disponibilização da informação ou consumo dos créditos.
                </p>
              </section>

              <section className="pt-8 border-t border-white/10">
                <p className="text-sm text-gray-500 text-center italic">
                  Ao utilizar o {siteTitle}, você declara ter lido, compreendido e aceitado todos os termos e condições aqui estabelecidos.
                </p>
              </section>

            </div>
          </div>
        </div>
      </main>

      {/* Footer Simplificado */}
      <footer className="py-12 border-t border-white/10">
        <div className="container-premium text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {siteTitle}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

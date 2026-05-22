import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { ArrowLeft, Search, Shield, Lock, Scale, Briefcase, Gavel, Handshake, AlertCircle } from "lucide-react";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

/**
 * Página de Termos de Uso e Políticas
 * Conteúdo baseado na referência, adaptado em layout claro corporativo.
 */
export default async function TermosPage() {
  const settings = await prisma.systemSetting.findFirst();
  const siteTitle = settings?.siteTitle?.split(' - ')[0] || "Detetive Buscas";
  const companyEmail = settings?.companyEmail || "contato@seusite.com";

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
              <img src={settings.logoUrl} alt="Logo" className="h-7 w-auto object-contain" />
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
          {/* Hero da Página */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/50 text-[#2872fa] text-xs font-semibold mb-6">
              <Shield className="w-3.5 h-3.5" />
              Conformidade Legal & Segurança
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight mb-6">
              Termos de Uso e <br className="hidden sm:block" />
              <span className="text-[#2872fa]">Condições de Serviço</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Conteúdo dos Termos */}
          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-8 md:p-12 shadow-sm text-left">
            <div className="space-y-12 text-slate-600">
              
              {/* Seção 1 - Escopo */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                  <Scale className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">1. Escopo dos Serviços</h2>
                </div>
                <div className="space-y-3 text-sm md:text-base leading-relaxed">
                  <p>1.1. O escopo do presente termo é a adesão pelo CLIENTE ao conjunto completo de Serviços a serem disponibilizados pelo <strong>{siteTitle}</strong> em seu Portal, ou quaisquer outros serviços que venham a ser oferecidos.</p>
                  <p>1.2. O CLIENTE selecionará no Portal, de forma unilateral e por livre e espontânea manifestação de vontade, quais serviços disponibilizados irá utilizar, através da configuração de seus acessos, de seus processos de integração internos, ou de qualquer outra forma que julgar necessária.</p>
                  <p>1.3. Os Serviços serão disponibilizados dentro do portal com acesso controlado por meio de credenciais únicas disponibilizadas para cada CLIENTE, contratado diretamente no Portal e seu uso cobrado conforme a quantidade de consultas realizadas.</p>
                  <p>1.3.1. Considerando que algumas consultas disponibilizadas pelo {siteTitle} aos clientes dependem de informações de fornecedores externos, incluindo órgãos de Governo, e que alguns fornecedores externos não garantem a continuidade dos serviços, o {siteTitle} se obriga a informar os clientes tão logo tome conhecimento de eventuais indisponibilidades.</p>
                  <p>1.4. O {siteTitle} poderá promover unilateralmente a alteração da forma e/ou funcionalidades dos Serviços visando melhorias constantes.</p>
                  <p>1.5. As consultas serão cobradas quando o status de retorno seja "Sucesso" ou "Sucesso com Ressalvas". Consultas duplicadas (mesmo documento consultado no mesmo dia) serão cobradas normalmente.</p>
                </div>
              </section>

              {/* Direito de Arrependimento */}
              <section className="bg-rose-50 border border-rose-100 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3 text-rose-800">
                  <AlertCircle className="w-6 h-6" />
                  <h2 className="text-lg font-bold">Direito de Arrependimento</h2>
                </div>
                <div className="space-y-2 text-xs md:text-sm text-rose-700 leading-relaxed">
                  <p>1.6. As Partes reconhecem que a presente contratação é realizada em ambiente empresarial (B2B), não se caracterizando relação de consumo nos termos do Código de Defesa do Consumidor.</p>
                  <p>1.7. Em razão do caráter empresarial da contratação, não se aplica o direito de arrependimento previsto no artigo 49 do CDC.</p>
                  <p>1.8. <strong>Execução Imediata:</strong> Considerando que os serviços consistem em consultas e entregas de dados digitais em tempo real, a execução ocorre de forma imediata, razão pela qual não há possibilidade de cancelamento ou estorno após a efetiva disponibilização da informação.</p>
                </div>
              </section>

              {/* Vigência */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                  <Briefcase className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">2. Vigência e Prazo</h2>
                </div>
                <div className="space-y-3 text-sm md:text-base leading-relaxed">
                  <p>2.1. Este Termo terá vigência por prazo indeterminado.</p>
                  <p>2.2. Os Serviços serão utilizados mediante saldo em reais que poderá ser utilizado em todas as consultas e módulos do {siteTitle} enquanto houver saldo suficiente.</p>
                </div>
              </section>

              {/* Obrigações */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                  <Handshake className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">3. Obrigações das Partes</h2>
                </div>
                <div className="space-y-3 text-sm md:text-base leading-relaxed">
                  <p>3.1. <strong>Do {siteTitle}:</strong> Se compromete com a licitude, legalidade e ética das fontes das quais obtém as informações repassadas ao CLIENTE.</p>
                  <p>3.2. <strong>Do CLIENTE:</strong> Realizar a recarga do saldo, ciente de que a disponibilidade depende do tempo de compensação bancária. Não utilizar os dados para finalidades que infrinjam qualquer lei ou regulamento aplicável.</p>
                </div>
              </section>

              {/* Confidencialidade */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                  <Lock className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">4. Confidencialidade e Tratamento</h2>
                </div>
                <div className="space-y-3 text-sm md:text-base leading-relaxed">
                  <p>4.1. As PARTES deverão guardar sigilo e confidencialidade dos dados e informações disponibilizadas através do uso dos Serviços.</p>
                  <p>4.2. O CLIENTE autoriza o {siteTitle} a coletar e sumarizar dados para fins de controle, auditoria, qualidade e geração de estatísticas, garantindo a anonimização de dados pessoais em caso de comercialização de subprodutos de informação.</p>
                </div>
              </section>

              {/* Privacidade (LGPD) */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                  <Shield className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">5. Privacidade e Proteção de Dados (LGPD)</h2>
                </div>
                <div className="space-y-3 text-sm md:text-base leading-relaxed">
                  <p>5.1. Ambas as partes se obrigam a estar em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong>.</p>
                  <p>5.2. É proibido o tratamento dos dados pessoais para qualquer fim que não esteja diretamente relacionado a processos de avaliação de crédito, celebração de contratos, operações de cobrança ou de legítimo interesse.</p>
                  <p>5.3. O CLIENTE deverá notificar o {siteTitle} em até 48 horas a respeito de qualquer violação de segurança de dados pessoais ocorrida em seu âmbito de responsabilidade.</p>
                </div>
              </section>

              {/* Anticorrupção */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-[#2872fa]">
                  <Gavel className="w-6 h-6" />
                  <h2 className="text-xl md:text-2xl font-bold text-[#243b56]">6. Política Anticorrupção</h2>
                </div>
                <div className="text-sm md:text-base leading-relaxed">
                  <p>6.1. O {siteTitle} e o CLIENTE se obrigam a cumprir a legislação brasileira anticorrupção e contra a lavagem de dinheiro, declarando não estarem envolvidos em atividades ilícitas sob investigação.</p>
                </div>
              </section>

              {/* Anexos */}
              <section className="bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-8">
                <h3 className="text-lg font-bold text-[#243b56] border-b border-slate-200 pb-4">Anexos de Serviço</h3>
                
                <div className="space-y-3">
                  <h4 className="text-[#2872fa] font-bold uppercase text-xs tracking-wider">Pagamento</h4>
                  <ul className="list-disc pl-5 space-y-2 text-xs md:text-sm">
                    <li>O uso se dá mediante saldo em reais conforme o consumo.</li>
                    <li>Novas recargas podem ser feitas via meios disponíveis no Portal.</li>
                    <li>Valores podem ser reajustados unilateralmente mediante aviso de 30 dias.</li>
                    <li>No caso de rescisão pelo CLIENTE, o saldo remanescente não será reembolsado.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[#2872fa] font-bold uppercase text-xs tracking-wider">Suporte e Atendimento</h4>
                  <p className="text-xs md:text-sm">Dúvidas podem ser enviadas para: <span className="text-[#243b56] font-bold">{companyEmail}</span></p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] uppercase font-bold tracking-tighter text-slate-500 text-center">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">Severidade 1: 6h Úteis</div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">Severidade 2: 10h Úteis</div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">Severidade 3: 2 Dias</div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">Severidade 4: 3 Dias</div>
                  </div>
                </div>
              </section>

              <section className="pt-8 border-t border-slate-100">
                <p className="text-xs md:text-sm text-slate-400 text-center italic leading-relaxed">
                  Ao utilizar a plataforma {siteTitle}, você declara ter lido, compreendido e aceitado todos os termos e condições aqui estabelecidos. A tolerância de qualquer das PARTES em relação ao descumprimento não caracterizará renúncia de direitos.
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

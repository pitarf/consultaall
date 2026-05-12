import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { ArrowLeft, Search, Shield, Lock, Scale, FileText, Briefcase, Gavel, Handshake, AlertCircle } from "lucide-react";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

/**
 * Página de Termos de Uso e Políticas
 * Conteúdo integralmente baseado na referência DirectData, adaptado dinamicamente.
 */
export default async function TermosPage() {
  const settings = await prisma.systemSetting.findFirst();
  const siteTitle = settings?.siteTitle?.split(' - ')[0] || "Detetive Buscas";
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
              Conformidade Legal & Segurança
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Termos de Uso e <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Condições de Serviço</span>
            </h1>
            <p className="text-gray-400">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Conteúdo dos Termos */}
          <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="prose prose-invert max-w-none space-y-12 text-gray-300">
              
              {/* Seção 2 - Escopo */}
              <section>
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <Scale className="w-6 h-6" />
                  <h2 className="text-2xl font-bold m-0 text-white">1. Escopo dos Serviços</h2>
                </div>
                <div className="space-y-4">
                  <p>1.1. O escopo do presente termo é a adesão pelo CLIENTE ao conjunto completo de Serviços a serem disponibilizados pelo <strong>{siteTitle}</strong> em seu Portal, ou quaisquer outros serviços que venham a ser oferecidos.</p>
                  <p>1.2. O CLIENTE selecionará no Portal, de forma unilateral e por livre e espontânea manifestação de vontade, quais serviços disponibilizados irá utilizar, através da configuração de seus acessos, de seus processos de integração internos, ou de qualquer outra forma que julgar necessária.</p>
                  <p>1.3. Os Serviços serão disponibilizados dentro do portal com acesso controlado por meio de credenciais únicas disponibilizadas para cada CLIENTE, contratado diretamente no Portal e seu uso cobrado conforme a quantidade de consultas realizadas.</p>
                  <p>1.3.1. Considerando que algumas consultas disponibilizadas pelo {siteTitle} aos clientes dependem de informações de fornecedores externos, incluindo órgãos de Governo, e que alguns fornecedores externos não garantem a continuidade dos serviços, o {siteTitle} se obriga a informar os clientes tão logo tome conhecimento de eventuais indisponibilidades.</p>
                  <p>1.4. O {siteTitle} poderá promover unilateralmente a alteração da forma e/ou funcionalidades dos Serviços visando melhorias constantes.</p>
                  <p>1.5. As consultas serão cobradas quando o status de retorno seja "Sucesso" ou "Sucesso com Ressalvas". Consultas duplicadas (mesmo documento consultado no mesmo dia) serão cobradas normalmente.</p>
                </div>
              </section>

              {/* Direito de Arrependimento */}
              <section className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4 text-red-400">
                  <AlertCircle className="w-6 h-6" />
                  <h2 className="text-xl font-bold m-0 text-white">Direito de Arrependimento</h2>
                </div>
                <div className="space-y-4 text-sm text-gray-400">
                  <p>1.6. As Partes reconhecem que a presente contratação é realizada em ambiente empresarial (B2B), não se caracterizando relação de consumo nos termos do Código de Defesa do Consumidor.</p>
                  <p>1.7. Em razão do caráter empresarial da contratação, não se aplica o direito de arrependimento previsto no artigo 49 do CDC.</p>
                  <p>1.8. <strong>Execução Imediata:</strong> Considerando que os serviços consistem em consultas e entregas de dados digitais em tempo real, a execução ocorre de forma imediata, razão pela qual não há possibilidade de cancelamento ou estorno após a efetiva disponibilização da informação.</p>
                </div>
              </section>

              {/* Vigência */}
              <section>
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <Briefcase className="w-6 h-6" />
                  <h2 className="text-2xl font-bold m-0 text-white">2. Vigência e Prazo</h2>
                </div>
                <p>2.1. Este Termo terá vigência por prazo indeterminado.</p>
                <p>2.2. Os Serviços serão utilizados mediante saldo em reais que poderá ser utilizado em todas as consultas e módulos do {siteTitle} enquanto houver saldo suficiente.</p>
              </section>

              {/* Obrigações */}
              <section>
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <Handshake className="w-6 h-6" />
                  <h2 className="text-2xl font-bold m-0 text-white">3. Obrigações das Partes</h2>
                </div>
                <div className="space-y-4">
                  <p>3.1. <strong>Do {siteTitle}:</strong> Se compromete com a licitude, legalidade e ética das fontes das quais obtém as informações repassadas ao CLIENTE.</p>
                  <p>3.2. <strong>Do CLIENTE:</strong> Realizar a recarga do saldo, ciente de que a disponibilidade depende do tempo de compensação bancária. Não utilizar os dados para finalidades que infrinjam qualquer lei ou regulamento aplicável.</p>
                </div>
              </section>

              {/* Confidencialidade */}
              <section>
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <Lock className="w-6 h-6" />
                  <h2 className="text-2xl font-bold m-0 text-white">4. Confidencialidade e Tratamento</h2>
                </div>
                <p>4.1. As PARTES deverão guardar sigilo e confidencialidade dos dados e informações disponibilizadas através do uso dos Serviços.</p>
                <p>4.2. O CLIENTE autoriza o {siteTitle} a coletar e sumarizar dados para fins de controle, auditoria, qualidade e geração de estatísticas, garantindo a anonimização de dados pessoais em caso de comercialização de subprodutos de informação.</p>
              </section>

              {/* Privacidade (LGPD) */}
              <section>
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <Shield className="w-6 h-6" />
                  <h2 className="text-2xl font-bold m-0 text-white">5. Privacidade e Proteção de Dados (LGPD)</h2>
                </div>
                <div className="space-y-4">
                  <p>5.1. Ambas as partes se obrigam a estar em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong>.</p>
                  <p>5.2. É proibido o tratamento dos dados pessoais para qualquer fim que não esteja diretamente relacionado a processos de avaliação de crédito, celebração de contratos, operações de cobrança ou de legítimo interesse.</p>
                  <p>5.3. O CLIENTE deverá notificar o {siteTitle} em até 48 horas a respeito de qualquer violação de segurança de dados pessoais ocorrida em seu âmbito de responsabilidade.</p>
                </div>
              </section>

              {/* Anticorrupção */}
              <section>
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <Gavel className="w-6 h-6" />
                  <h2 className="text-2xl font-bold m-0 text-white">6. Política Anticorrupção</h2>
                </div>
                <p>6.1. O {siteTitle} e o CLIENTE se obrigam a cumprir a legislação brasileira anticorrupção e contra a lavagem de dinheiro, declarando não estarem envolvidos em atividades ilícitas sob investigação.</p>
              </section>

              {/* Anexos */}
              <section className="bg-white/5 rounded-3xl p-8 border border-white/5 space-y-8">
                <h3 className="text-xl font-bold text-white m-0 border-b border-white/10 pb-4">Anexos de Serviço</h3>
                
                <div className="space-y-4">
                  <h4 className="text-primary font-bold m-0 uppercase text-xs tracking-widest">Pagamento</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>O uso se dá mediante saldo em reais conforme o consumo.</li>
                    <li>Novas recargas podem ser feitas via meios disponíveis no Portal.</li>
                    <li>Valores podem ser reajustados unilateralmente mediante aviso de 30 dias.</li>
                    <li>No caso de rescisão pelo CLIENTE, o saldo remanescente não será reembolsado.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-primary font-bold m-0 uppercase text-xs tracking-widest">Suporte e Atendimento</h4>
                  <p className="text-sm">Dúvidas podem ser enviadas para: <span className="text-white font-medium">{companyEmail}</span></p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] uppercase font-bold tracking-tighter">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">Severidade 1: 6h Úteis</div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">Severidade 2: 10h Úteis</div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">Severidade 3: 2 Dias</div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">Severidade 4: 3 Dias</div>
                  </div>
                </div>
              </section>

              <section className="pt-8 border-t border-white/10">
                <p className="text-sm text-gray-500 text-center italic leading-relaxed">
                  Ao utilizar a plataforma {siteTitle}, você declara ter lido, compreendido e aceitado todos os termos e condições aqui estabelecidos. A tolerância de qualquer das PARTES em relação ao descumprimento não caracterizará renúncia de direitos.
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

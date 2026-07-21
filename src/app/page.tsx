import Link from 'next/link';
import { prisma } from '../lib/prisma';
import NavbarClient from '@/components/NavbarClient';
import HomeTabs from '@/components/HomeTabs';
import FaqAccordion from '@/components/FaqAccordion';
import { 
  ShieldCheck, 
  Search, 
  Zap, 
  FileText, 
  Scale, 
  ArrowRight,
  TrendingUp,
  Fingerprint,
  RefreshCw,
  Users2,
  Wallet,
  CheckCircle,
  Building2,
  Car,
  UserCheck,
  CreditCard,
  Users
} from 'lucide-react';

/**
 * Nova Landing Page Whitelist Principal do Detetive Buscas
 * Design institucional corporativo (SaaS Light Premium) baseado no site de referência DeskData.
 * Focado em enriquecimento de leads, validação cadastral, compliance e prevenção a fraudes.
 * 100% otimizado para aprovação do Google Ads.
 */
export default async function Home() {
  const [settings, pricings] = await Promise.all([
    prisma.systemSetting.findFirst(),
    prisma.modulePricing.findMany()
  ]);

  const getPrice = (id: string, defaultPrice: number) => {
    const found = pricings.find(p => p.id === id);
    return found ? found.price : defaultPrice;
  };

  const categories = [
    {
      title: "Dados Pessoais",
      icon: <UserCheck className="w-5 h-5 text-[#2872fa]" />,
      items: [
        { name: "Dados básicos", price: getPrice('dados_basicos', 1.00) },
        { name: "Documentos (RG/PIS/NIS)", price: getPrice('documentos', 1.00) },
        { name: "E-mails", price: getPrice('emails', 0.50) },
        { name: "Telefones", price: getPrice('telefones', 0.50) },
        { name: "Endereços", price: getPrice('enderecos', 1.00) },
      ]
    },
    {
      title: "Pessoas Relacionadas",
      icon: <Users className="w-5 h-5 text-purple-600" />,
      items: [
        { name: "Parentes", price: getPrice('parentes', 1.00) },
        { name: "Vizinhos", price: getPrice('vizinhos', 1.00) },
        { name: "Sócios / Empresas", price: getPrice('socio_empresa', 1.50) },
      ]
    },
    {
      title: "Patrimônio e Renda",
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      items: [
        { name: "Poder Aquisitivo", price: getPrice('poder_aquisitivo', 1.50) },
        { name: "Dados Trabalhistas", price: getPrice('dados_trabalhistas', 1.00) },
        { name: "Seguro Social (INSS)", price: getPrice('seguro_social', 1.00) },
      ]
    },
    {
      title: "Veículos",
      icon: <Car className="w-5 h-5 text-amber-600" />,
      items: [
        { name: "Dados Básicos e Técnicos", price: getPrice('veiculo_basico', 1.00) },
        { name: "Situação e Documentação", price: getPrice('veiculo_documentacao', 1.00) },
        { name: "Dados do Proprietário", price: getPrice('veiculo_proprietario', 1.50) },
        { name: "Restrições e Histórico", price: getPrice('veiculo_restricoes', 2.00) },
      ]
    },
    {
      title: "Empresas (CNPJ)",
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
      items: [
        { name: "Dados Básicos e Natureza", price: getPrice('cnpj_basico', 1.00) },
        { name: "Contato e Localização", price: getPrice('cnpj_contato', 1.00) },
        { name: "Quadro Societário (QSA)", price: getPrice('cnpj_socios', 1.50) },
        { name: "Faturamento e Porte", price: getPrice('cnpj_faturamento', 2.00) },
      ]
    },
    {
      title: "Crédito e Histórico",
      icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
      items: [
        { name: "Score de Crédito", price: getPrice('analise_credito', 2.00) },
        { name: "Processos Judiciais", price: getPrice('processos', 1.00) },
        { name: "Certidões Negativas", price: getPrice('certidoes', 1.00) },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-x-hidden">
      
      {/* ===================== NAVBAR ===================== */}
      <NavbarClient logoUrl={settings?.logoUrl} siteTitle={settings?.siteTitle} />

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative py-20 md:py-28 bg-white overflow-hidden border-b border-slate-200">
        {/* Elementos de background abstratos e elegantes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-50 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Texto Hero */}
            <div className="lg:col-span-7 space-y-8 text-left">
              {/* Badge Whitelist */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/50 text-[#2872fa] text-xs font-semibold tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                Plataforma Corporativa B2B
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#243b56] tracking-tight leading-[1.1]">
                Consulte CPF, Telefone e Placa <span className="text-[#2872fa]">em Segundos</span>
              </h1>
              
              <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Tenha acesso rápido a informações cadastrais, telefones, placas e vínculos através da nossa plataforma online.
              </p>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/cadastro"
                  className="bg-[#2872fa] hover:bg-[#1a5ecd] text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-[#2872fa]/10 flex items-center justify-center gap-2 group transition-all active:scale-95 text-base animate-pulse"
                >
                  Consultar Agora 🔎
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors text-base"
                >
                  Entrar no Painel
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Conformidade com a LGPD
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#2872fa]" />
                  Retornos em Milissegundos
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Sem taxas de adesão
                </span>
              </div>
            </div>

            {/* Ilustração/Mockup Hero */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                {/* Elementos flutuantes simulando dados */}
                <div className="absolute -top-6 -left-6 bg-white p-4 rounded-xl border border-slate-200 shadow-md flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-slate-400 font-bold">STATUS</div>
                    <div className="text-xs font-bold text-[#243b56]">Valido (100%)</div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl border border-slate-200 shadow-md flex items-center gap-3 animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-[#2872fa]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-slate-400 font-bold">SPEED</div>
                    <div className="text-xs font-bold text-[#243b56]">240ms</div>
                  </div>
                </div>

                {/* Dashboard Mockup Central */}
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="w-full h-3 border-b border-slate-200 pb-3 flex items-center gap-1.5 mb-5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="h-6 w-1/3 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-200 rounded-md animate-pulse" />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="h-16 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                        <span className="h-2 w-1/2 bg-slate-100 rounded animate-pulse" />
                        <span className="h-3 w-3/4 bg-slate-200 rounded animate-pulse" />
                      </div>
                      <div className="h-16 bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                        <span className="h-2 w-1/2 bg-slate-100 rounded animate-pulse" />
                        <span className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-20 bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                      <span className="block h-2.5 w-full bg-slate-200 rounded animate-pulse" />
                      <span className="block h-2.5 w-5/6 bg-slate-200 rounded animate-pulse" />
                      <span className="block h-2.5 w-2/3 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== METRICS STRIP ===================== */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "99.9%", label: "Uptime do Motor" },
              { value: "24/7", label: "Monitoramento Ativo" },
              { value: "0ms", label: "Latência Reduzida" },
              { value: "100%", label: "Conforme com LGPD" },
            ].map((metric) => (
              <div key={metric.label} className="space-y-1">
                <p className="text-3xl font-extrabold text-[#243b56]">
                  {metric.value}
                </p>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== COMO FUNCIONA ===================== */}
      <section id="como-funciona" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <span className="text-[#2872fa] text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full">
              Processo Simples
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#243b56]">
              Como Funciona a Validação?
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Simplificamos o enriquecimento cadastral em três etapas práticas e automatizadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Linha conectora visual desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-100 -z-10" />

            {[
              { 
                step: "01", 
                title: "Parâmetros de Entrada", 
                desc: "Informe a chave de pesquisa (CPF, CNPJ, telefone, e-mail ou placa de veículo) de forma isolada." 
              },
              { 
                step: "02", 
                title: "Varredura Automatizada", 
                desc: "Nosso motor realiza o processamento em milissegundos cruzando dezenas de bases de dados integradas." 
              },
              { 
                step: "03", 
                title: "Relatório de Resultados", 
                desc: "Receba os dados cadastrais estruturados e formatados, prontos para análise comercial ou de conformidade." 
              },
            ].map((item, index) => (
              <div key={index} className="bg-slate-50 border border-slate-200/60 rounded-3xl p-8 space-y-5 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-lg font-bold text-[#2872fa] shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-[#243b56]">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TABELA DE PREÇOS E MÓDULOS (PREÇOS) ===================== */}
      <section id="precos" className="py-20 bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <span className="text-emerald-600 bg-emerald-50 border border-emerald-200/60 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Preços Transparentes & Sem Mensalidade
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#243b56] tracking-tight">
              Pague Apenas Pelo Que Consultar
            </h2>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
              Sem taxas ocultas, contratos de fidelidade ou mensalidades. Adicione saldo via Pix e consulte os dados que precisar em tempo real.
            </p>
          </div>

          {/* Destaque de Benefícios da Tarifação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900 text-sm">A Partir de R$ 0,50</h4>
                <p className="text-xs text-slate-500">Módulos avulsos e fracionados por consulta</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900 text-sm">Recarga Instantânea via Pix</h4>
                <p className="text-xs text-slate-500">Saldo liberado automaticamente no painel</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900 text-sm">Cache Inteligente Integrado</h4>
                <p className="text-xs text-slate-500">Zero cobrança duplicada em buscas recentes</p>
              </div>
            </div>
          </div>

          {/* Grid de Categorias e Módulos com Preços Dinâmicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-[#2872fa]/40 hover:shadow-lg transition-all text-left">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h3 className="font-bold text-lg text-[#243b56] flex items-center gap-2">
                      {cat.icon}
                      {cat.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                      {cat.items.length} módulos
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {cat.items.map((item, i) => (
                      <li key={i} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
                        <span className="text-slate-700 font-medium">{item.name}</span>
                        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded text-[11px]">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-200/60">
                  <Link
                    href="/cadastro"
                    className="w-full bg-white hover:bg-[#2872fa] hover:text-white border border-slate-300 hover:border-[#2872fa] text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm group"
                  >
                    Consultar este Módulo
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-blue-50/60 border border-blue-100 rounded-2xl p-6 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <h4 className="font-bold text-sm text-[#243b56]">Quer testar a plataforma agora mesmo?</h4>
              <p className="text-xs text-slate-600">Crie sua conta em menos de 1 minuto sem precisar de cartão de crédito.</p>
            </div>
            <Link
              href="/cadastro"
              className="bg-[#2872fa] hover:bg-[#1a5ecd] text-white text-xs font-bold py-3 px-6 rounded-xl shadow-md transition-all shrink-0 active:scale-95"
            >
              Criar Conta Gratuita 🚀
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== CONSULTAS DISPONÍVEIS (RECURSOS) ===================== */}
      <section id="recursos" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <span className="text-[#2872fa] text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full">
              Inteligência de Dados
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#243b56]">
              Fontes de Consultas Disponíveis
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Selecione o tipo de validação para visualizar a estrutura dos dados retornados pela plataforma.
            </p>
          </div>

          {/* Abas e Mockups Interativos Client */}
          <HomeTabs />

          {/* Disclaimer de Mockups Fictícios para o Google Ads */}
          <p className="mt-6 text-slate-400 text-[11px] leading-relaxed max-w-2xl mx-auto font-medium">
            * Os dados exibidos nas abas de demonstração acima são estritamente fictícios e conceituais, tendo como propósito exclusivo ilustrar o formato técnico do retorno do nosso motor de dados. Dados reais serão exibidos apenas em consultas reais no painel logado.
          </p>
        </div>
      </section>

      {/* ===================== APLICAÇÕES B2B ===================== */}
      <section id="aplicacoes" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <span className="text-[#2872fa] text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full">
              Aplicações Práticas
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#243b56]">
              Casos de Uso da Plataforma
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Descubra como o motor Detetive Buscas ajuda diferentes verticais corporativas a mitigarem riscos e otimizarem cadastros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Fingerprint,
                title: "Prevenção a Fraudes e Identidade",
                desc: "Valide dados de novos cadastros e certifique-se de que os CPFs informados são consistentes com a Receita Federal e não pertencem a pessoas falecidas."
              },
              {
                icon: RefreshCw,
                title: "Higienização e Enriquecimento",
                desc: "Atualize carteiras de clientes corporativos obsoletas recuperando novos canais de contato e endereços para otimizar suas estratégias de vendas."
              },
              {
                icon: Scale,
                title: "Compliance e Risco (KYC)",
                desc: "Estruture background checks de fornecedores e parceiros verificando a saúde cadastral corporativa e o quadro societário em segundos."
              },
              {
                icon: Users2,
                title: "Localização de Clientes",
                desc: "Recupere localizações geográficas e contatos vinculados a clientes com pendências financeiras para processos de renegociação amigáveis."
              },
              {
                icon: ShieldCheck,
                title: "Validação Cadastral Integrada",
                desc: "Unifique em um único local consultas complexas que exigiriam buscas manuais em dezenas de páginas estatais de forma lenta."
              },
              {
                icon: TrendingUp,
                title: "Análise de Renda e Faixa Salarial",
                desc: "Entenda o perfil socioeconômico aproximado de potenciais parceiros com estimativas de renda e faixas salariais padronizadas por CBO."
              }
            ].map((app, index) => {
              const Icon = app.icon;
              return (
                <div key={index} className="bg-slate-50 border border-slate-200/60 rounded-3xl p-8 space-y-4 hover:-translate-y-1 transition-all duration-300 text-left">
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-[#2872fa] shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#243b56]">{app.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{app.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== FAQ SECTION ===================== */}
      <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <span className="text-[#2872fa] text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full">
              Dúvidas Frequentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#243b56]">
              Perguntas e Respostas Institucionais
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Encontre respostas para as principais questões cadastrais, LGPD e de faturamento da nossa plataforma B2B.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[#2872fa]/5 -z-10" />
        <div className="max-w-5xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight leading-tight">
            Comece a Validar Seus Cadastro <br className="hidden md:block"/> de Forma Profissional
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            Integre consultas rápidas, reduza custos operacionais com nosso cache interno e tenha conformidade de proteção de dados e privacidade em todas as buscas.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/cadastro"
              className="bg-[#2872fa] hover:bg-[#1a5ecd] text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-[#2872fa]/20 transition-all active:scale-95 text-lg"
            >
              Criar Conta Gratuita
            </Link>
            <Link
              href="#faq"
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold py-4 px-10 rounded-xl transition-colors text-lg"
            >
              Tirar Dúvidas
            </Link>
          </div>
          <p className="text-slate-500 text-xs font-medium">
            * Modelo Pay-per-use corporativo • Sem taxas mensais fixas • Cadastro rápido
          </p>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-[#1c2639] text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-between gap-8 pb-12 border-b border-slate-800 text-center md:text-left">
            {/* Logo */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              {settings?.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#2872fa] flex items-center justify-center shadow-md">
                  <Search className="w-4.5 h-4.5 text-white" />
                </div>
              )}
              <span className="text-lg font-bold text-white tracking-tight">
                Detetive<span className="text-[#2872fa]">Buscas</span>
              </span>
            </div>

            {/* Links rápidos */}
            <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold">
              <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
              <Link href="/cadastro" className="hover:text-white transition-colors">Cadastrar-se</Link>
              <Link href="/protecao-de-dados" className="hover:text-white transition-colors text-blue-400">Proteção de Dados (LGPD)</Link>
              <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            </div>

            {/* Copyrigth */}
            <p className="text-xs text-slate-500 text-center md:text-right">
              © {new Date().getFullYear()} Detetive Buscas. Inteligência de dados e background check.
            </p>
          </div>

          {/* Declaração de conformidade de Whitelist */}
          <div className="pt-8 text-center text-[10px] text-slate-500 max-w-4xl mx-auto leading-relaxed space-y-2">
            <p>
              A Detetive Buscas é uma plataforma tecnológica de enriquecimento cadastral desenvolvida estritamente para uso corporativo (B2B). Nossos relatórios são estruturados a partir do processamento automatizado de bases públicas oficiais e provedores regulamentados sob a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD).
            </p>
            <p>
              Garantimos o livre exercício dos direitos dos titulares de dados. Caso deseje solicitar o bloqueio ou a restrição da visualização do seu cadastro em nossa ferramenta de busca, utilize o formulário de Opt-out no nosso canal oficial de Proteção de Dados acima.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

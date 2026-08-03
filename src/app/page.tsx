import Link from 'next/link';
import { prisma } from '../lib/prisma';
import NavbarClient from '@/components/NavbarClient';
import Footer from '@/components/Footer';
import HomeTabs from '@/components/HomeTabs';
import FaqAccordion from '@/components/FaqAccordion';
import HomeSearchBox from '@/components/HomeSearchBox';
import { Metadata } from 'next';
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

export async function generateMetadata(): Promise<Metadata> {
  const title = "Consulta CPF, Telefone, CNPJ e Placa | Detetive Buscas";
  const description = "Consulte CPF, telefone, CNPJ, nome e placa em uma plataforma online com módulos avulsos, preços transparentes e pagamento via Pix. Acesse o Detetive Buscas.";

  return {
    title,
    description,
    alternates: {
      canonical: "https://detetivebuscas.com/"
    },
    robots: "index, follow, max-image-preview:large",
    openGraph: {
      title,
      description,
      url: "https://detetivebuscas.com/",
      siteName: "Detetive Buscas",
      images: [
        {
          url: "https://detetivebuscas.com/og-detetive-buscas.jpg",
          width: 1200,
          height: 630,
          alt: "Detetive Buscas - Plataforma de consultas online"
        }
      ],
      type: "website",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://detetivebuscas.com/og-detetive-buscas.jpg"]
    }
  };
}

/**
 * Nova Landing Page Whitelist Principal do Detetive Buscas
 * Design institucional corporativo (SaaS Light Premium) baseado no site de referência DeskData.
 * Focado em enriquecimento de leads, validação cadastral, compliance e prevenção a fraudes.
 * 100% otimizado para aprovação do Google Ads.
 */
export default async function Home() {
  const [settings, pricings, seoPages, latestArticles, menuPages] = await Promise.all([
    prisma.systemSetting.findFirst(),
    prisma.modulePricing.findMany(),
    prisma.page.findMany({
      where: {
        published: true,
        OR: [
          { publishedAt: null },
          { publishedAt: { lte: new Date() } }
        ]
      },
      select: { title: true, slug: true, showInFooter: true },
      orderBy: { title: 'asc' }
    }),
    prisma.article.findMany({
      where: {
        published: true,
        OR: [
          { publishedAt: null },
          { publishedAt: { lte: new Date() } }
        ]
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { title: true, slug: true, metaDescription: true, createdAt: true }
    }),
    prisma.page.findMany({
      where: {
        published: true,
        showInMenu: true,
        OR: [
          { publishedAt: null },
          { publishedAt: { lte: new Date() } }
        ]
      },
      select: { title: true, slug: true },
      orderBy: { title: 'asc' }
    })
  ]);

  const footerPages = seoPages.filter(p => p.showInFooter);

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
      <NavbarClient logoUrl={settings?.logoUrl} siteTitle={settings?.siteTitle} menuPages={menuPages} />

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
                Plataforma de consultas online
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#243b56] tracking-tight leading-[1.1]">
                Consulte CPF, Telefone, CNPJ e Placa Online <br className="hidden md:block" />
                <span className="text-[#2872fa] font-bold">em uma única plataforma</span>
              </h1>
              
              <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Acesse diferentes módulos de consulta cadastral em uma única plataforma. Consulte informações relacionadas a CPF, telefone, CNPJ, nome e veículos, pagando somente pelos módulos utilizados.
              </p>

              <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                Escolha abaixo o tipo de consulta desejada ou acesse o painel para realizar verificações de forma rápida, organizada e responsável.
              </p>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/cadastro"
                  className="bg-[#2872fa] hover:bg-[#1a5ecd] text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-[#2872fa]/10 flex items-center justify-center gap-2 group transition-all active:scale-95 text-base"
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

            {/* Box de Pesquisa Interativo (Alta Conversão) */}
            <div className="lg:col-span-5 w-full">
              <HomeSearchBox />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== ESCOLHA O TIPO DE CONSULTA ===================== */}
      <section id="escolha-consulta" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <span className="text-[#2872fa] text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full">
              Módulos Específicos
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#243b56]">
              Escolha o tipo de consulta
            </h2>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
              Acesse a página correspondente ao tipo de informação que deseja verificar. Cada consulta possui módulos específicos, valores individuais e explicações sobre os dados que podem aparecer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Card 1: CPF */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-[#2872fa]/40 hover:shadow-lg transition-all text-left group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2872fa] flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#243b56] group-hover:text-[#2872fa] transition-colors">
                  Consulta de CPF
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Consulte informações cadastrais disponíveis relacionadas a um CPF, como dados básicos, telefones, endereços e outros módulos disponíveis na plataforma.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/consulta-cpf"
                  className="w-full bg-white hover:bg-[#2872fa] hover:text-white border border-slate-300 hover:border-[#2872fa] text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  Consultar CPF
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Telefone */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-[#2872fa]/40 hover:shadow-lg transition-all text-left group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2872fa] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#243b56] group-hover:text-[#2872fa] transition-colors">
                  Consulta de telefone
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Pesquise informações disponíveis relacionadas a números de telefone nacionais e verifique possíveis vínculos cadastrais.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/consulta-telefone"
                  className="w-full bg-white hover:bg-[#2872fa] hover:text-white border border-slate-300 hover:border-[#2872fa] text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  Consultar telefone
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Placa */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-[#2872fa]/40 hover:shadow-lg transition-all text-left group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2872fa] flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#243b56] group-hover:text-[#2872fa] transition-colors">
                  Consulta de placa
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Consulte dados básicos e informações disponíveis relacionadas a veículos por meio da placa informada.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/consulta-placa"
                  className="w-full bg-white hover:bg-[#2872fa] hover:text-white border border-slate-300 hover:border-[#2872fa] text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  Consultar placa
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 4: CNPJ */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-[#2872fa]/40 hover:shadow-lg transition-all text-left group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2872fa] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#243b56] group-hover:text-[#2872fa] transition-colors">
                  Consulta de CNPJ
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Verifique informações cadastrais disponíveis sobre empresas, incluindo situação cadastral, atividade e dados empresariais.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/consulta-cnpj"
                  className="w-full bg-white hover:bg-[#2872fa] hover:text-white border border-slate-300 hover:border-[#2872fa] text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  Consultar CNPJ
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 5: Nome */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between hover:border-[#2872fa]/40 hover:shadow-lg transition-all text-left group">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2872fa] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#243b56] group-hover:text-[#2872fa] transition-colors">
                  Consulta por nome
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Utilize nome e sobrenome para pesquisar resultados cadastrais disponíveis e refinar a busca por uma pessoa.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/consulta-nome"
                  className="w-full bg-white hover:bg-[#2872fa] hover:text-white border border-slate-300 hover:border-[#2872fa] text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  Consultar nome
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
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
              { value: "24 horas", label: "Plataforma disponível online" },
              { value: "Pagamento via Pix", label: "Liberação automática do saldo" },
              { value: "Sem mensalidade", label: "Pagamento por módulo utilizado" },
              { value: "Consultas organizadas", label: "Resultados separados por categoria" },
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
              Como funcionam as consultas?
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              O processo foi organizado para que o usuário selecione o tipo de pesquisa, escolha os módulos desejados e visualize os resultados disponíveis dentro do painel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Linha conectora visual desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-100 -z-10" />

            {[
              { 
                step: "01", 
                title: "Escolha o tipo de consulta", 
                desc: "Selecione uma consulta de CPF, telefone, CNPJ, nome ou placa e informe corretamente o dado solicitado." 
              },
              { 
                step: "02", 
                title: "Selecione os módulos", 
                desc: "Visualize os módulos disponíveis, confira os respectivos valores e escolha somente as informações necessárias para sua finalidade." 
              },
              { 
                step: "03", 
                title: "Acesse os resultados", 
                desc: "Após a confirmação, os resultados disponíveis serão apresentados de forma organizada dentro do painel." 
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

      {/* ===================== USO RESPONSÁVEL ===================== */}
      <section id="uso-responsavel" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-4">
            <span className="text-[#2872fa] text-xs font-bold uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-full">
              Termos e Conduta
            </span>
            <h2 className="text-3xl font-extrabold text-[#243b56]">
              Uso responsável das consultas
            </h2>
          </div>

          <div className="text-left bg-white border border-slate-200 rounded-3xl p-8 md:p-10 space-y-6 shadow-sm text-sm text-slate-600 leading-relaxed">
            <p>
              O Detetive Buscas deve ser utilizado exclusivamente para finalidades legítimas e de acordo com a legislação aplicável. O usuário é responsável pelas informações pesquisadas, pela finalidade da consulta e pelo uso realizado a partir dos resultados apresentados.
            </p>
            <p>
              A plataforma não deve ser utilizada para perseguição, ameaça, discriminação, fraude, extorsão, invasão de privacidade ou qualquer outra finalidade ilícita. Também não é permitido utilizar as informações obtidas para constranger pessoas, tomar decisões discriminatórias ou praticar atos que violem direitos de terceiros.
            </p>
            <p>
              Os resultados podem variar conforme a disponibilidade, a atualização e a abrangência das fontes consultadas. A presença ou ausência de uma informação não deve ser interpretada isoladamente como confirmação absoluta de identidade, propriedade, vínculo ou situação cadastral.
            </p>
            <p>
              Antes de realizar qualquer consulta, o usuário deve verificar se possui uma finalidade legítima e uma base adequada para tratar as informações pesquisadas.
            </p>
          </div>

          <div className="flex justify-center gap-6 text-sm font-bold">
            <Link href="/politica-de-privacidade" className="text-[#2872fa] hover:underline">
              Política de Privacidade
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/termos" className="text-[#2872fa] hover:underline">
              Termos de Uso
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== TABELA DE PREÇOS E MÓDULOS (PREÇOS) ===================== */}
      <section id="precos" className="py-20 bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <span className="text-emerald-600 bg-emerald-50 border border-emerald-200/60 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Preços transparentes & sem mensalidade
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#243b56] tracking-tight">
              Pague apenas pelo que consultar
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
              Fontes de consultas disponíveis
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

          {/* Bloco de Links Fortes de SEO (Texto Centralizado Elegante) */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-4xl mx-auto font-medium">
              Nosso painel é completo, com página de{' '}
              <Link href="/consulta-cpf" className="text-[#2872fa] hover:underline font-bold transition-all">
                consulta cpf
              </Link>
              ,{' '}
              <Link href="/consulta-telefone" className="text-[#2872fa] hover:underline font-bold transition-all">
                consulta telefone
              </Link>
              ,{' '}
              <Link href="/consulta-placa" className="text-[#2872fa] hover:underline font-bold transition-all">
                consulta placa
              </Link>
              ,{' '}
              <Link href="/consulta-nome" className="text-[#2872fa] hover:underline font-bold transition-all">
                consulta nome
              </Link>
              {' e '}
              <Link href="/consulta-cnpj" className="text-[#2872fa] hover:underline font-bold transition-all">
                consulta cnpj
              </Link>
              .
            </p>
          </div>
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
              Casos de uso da plataforma
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

      {/* ===================== PLATAFORMA DE CONSULTAS (SEO TEXT) ===================== */}
      <section id="seo-explicativo" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-[#243b56]">
            Plataforma de consultas cadastrais online
          </h2>
          <div className="text-left text-sm text-slate-600 leading-relaxed space-y-4">
            <p>
              O Detetive Buscas reúne diferentes tipos de consulta em um único painel online. Por meio da plataforma, o usuário pode acessar páginas específicas de <Link href="/consulta-cpf" className="text-[#2872fa] hover:underline font-semibold">consulta de CPF</Link>, <Link href="/consulta-telefone" className="text-[#2872fa] hover:underline font-semibold">consulta de telefone</Link>, <Link href="/consulta-cnpj" className="text-[#2872fa] hover:underline font-semibold">consulta de CNPJ</Link>, <Link href="/consulta-placa" className="text-[#2872fa] hover:underline font-semibold">consulta de placa</Link> e <Link href="/consulta-nome" className="text-[#2872fa] hover:underline font-semibold">consulta por nome</Link>.
            </p>
            <p>
              Cada página foi organizada para explicar como a respectiva consulta funciona, quais informações podem estar disponíveis e quais cuidados devem ser adotados durante a utilização. Dessa forma, o usuário pode escolher o serviço mais adequado antes de criar uma conta ou utilizar o saldo disponível.
            </p>
            <p>
              A consulta de CPF é indicada para verificações cadastrais relacionadas a pessoas físicas. A consulta de telefone permite pesquisar informações disponíveis vinculadas a um número nacional. A consulta de CNPJ apresenta dados empresariais e cadastrais disponíveis. Já a consulta de placa é direcionada à verificação de informações relacionadas a veículos.
            </p>
            <p>
              Também é possível utilizar a consulta por nome para refinar pesquisas quando o usuário dispõe apenas do nome ou do nome completo da pessoa pesquisada. Os resultados podem variar e dependem da precisão das informações informadas e da disponibilidade dos dados.
            </p>
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
              Perguntas e respostas institucionais
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
            Comece a realizar suas consultas <br className="hidden md:block"/> de forma profissional
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

      {/* ===================== ÚLTIMAS DO BLOG ===================== */}
      {latestArticles.length > 0 && (
        <section className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
              <div>
                <h2 className="text-3xl font-extrabold text-[#243b56] tracking-tight">
                  Central de dicas & conteúdo
                </h2>
                <p className="text-slate-500 mt-2 text-sm md:text-base max-w-xl">
                  Acompanhe as últimas publicações técnicas, tutoriais de conformidade cadastral e novidades de LGPD.
                </p>
              </div>
              <Link 
                href="/blog" 
                className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group whitespace-nowrap"
              >
                Ver todos os artigos
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestArticles.map((article) => (
                <div key={article.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">
                      {new Date(article.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <h3 className="font-bold text-slate-800 text-lg leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>
                    {article.metaDescription && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                        {article.metaDescription}
                      </p>
                    )}
                  </div>
                  <Link 
                    href={`/blog/${article.slug}`}
                    className="text-xs font-bold text-[#2872fa] hover:text-[#1a5ecd] flex items-center gap-1 mt-6"
                  >
                    Ler Artigo Completo →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== LINKS RÁPIDOS DE CONSULTA (SEO) ===================== */}
      {footerPages.length > 0 && (
        <section className="py-12 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#243b56] mb-4">
              Nossas Consultas Disponíveis
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500 font-medium">
              {footerPages.map((page) => (
                <Link 
                  key={page.slug} 
                  href={`/${page.slug}`} 
                  className="hover:text-blue-600 transition-colors hover:underline"
                >
                  {page.title.split(' - ')[0]}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== SCHEMAS JSON-LD ===================== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Detetive Buscas",
            "url": "https://detetivebuscas.com",
            "logo": "https://detetivebuscas.com/logo.webp"
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Detetive Buscas",
            "url": "https://detetivebuscas.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://detetivebuscas.com/cadastro?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Quais tipos de consulta estão disponíveis?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A plataforma possui páginas e módulos relacionados à consulta de CPF, telefone, CNPJ, nome e placa de veículo. A disponibilidade de informações pode variar conforme o tipo de pesquisa e o módulo selecionado."
                }
              },
              {
                "@type": "Question",
                "name": "Preciso pagar mensalidade para usar o Detetive Buscas?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Não há mensalidade obrigatória. O usuário pode adicionar saldo ao painel e pagar somente pelas consultas e módulos utilizados."
                }
              },
              {
                "@type": "Question",
                "name": "Como o pagamento é realizado?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "O saldo pode ser adicionado por meio de Pix. Após a confirmação do pagamento, o valor é disponibilizado no painel conforme as regras da plataforma."
                }
              },
              {
                "@type": "Question",
                "name": "Os resultados são sempre completos?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Não. A quantidade e a precisão das informações podem variar conforme os dados informados, a disponibilidade das fontes e a atualização dos registros."
                }
              },
              {
                "@type": "Question",
                "name": "Posso consultar qualquer pessoa?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "As consultas devem ser realizadas somente para finalidades legítimas e de acordo com a legislação aplicável. O usuário é responsável pela pesquisa realizada e pelo uso das informações obtidas."
                }
              },
              {
                "@type": "Question",
                "name": "É necessário informar a senha da pessoa pesquisada?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Não. A plataforma não solicita senhas de redes sociais, contas bancárias, e-mails ou outros serviços pertencentes à pessoa pesquisada."
                }
              },
              {
                "@type": "Question",
                "name": "Como escolho a consulta correta?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Acesse as páginas de consulta de CPF, telefone, CNPJ, nome ou placa e confira a explicação sobre os dados e módulos disponíveis em cada categoria."
                }
              },
              {
                "@type": "Question",
                "name": "Como entro em contato com o suporte?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "O atendimento deve ser solicitado pelos canais oficiais apresentados na página de contato ou dentro do painel do usuário."
                }
              }
            ]
          })
        }}
      />

      {/* ===================== FOOTER ===================== */}
      <Footer logoUrl={settings?.logoUrl} />
    </div>
  );
}

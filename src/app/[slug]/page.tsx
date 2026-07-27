import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import NavbarClient from '@/components/NavbarClient';
import Link from 'next/link';
import { Search } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

// 1. GERAÇÃO DE METADADOS DINÂMICOS
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Verifica se há um redirecionamento cadastrado primeiro
  const redirect = await prisma.redirect.findUnique({ where: { oldSlug: slug } });
  if (redirect) {
    // Se for redirecionamento, não precisamos de metadados pois faremos o redirect
    return {};
  }

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.published) {
    return {
      title: 'Página não encontrada',
      robots: 'noindex, nofollow',
    };
  }

  // Define a URL canônica automática se não for preenchida
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://detetivebuscas.com.br';
  const canonicalUrl = page.canonical || `${baseUrl}/${page.slug}`;

  // Processa as tags robots
  const robots = page.robotsIndex ? 'index, follow' : 'noindex, nofollow';

  // Processa metadados adicionais do JSON-LD se existirem
  let otherMetadata: any = {};
  if (page.openGraph) {
    try {
      otherMetadata = JSON.parse(page.openGraph);
    } catch (e) {
      console.error('Erro ao fazer parse do OpenGraph da página:', e);
    }
  }

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: page.robotsIndex,
      follow: page.robotsIndex,
    },
    openGraph: {
      title: page.title,
      description: page.metaDescription || undefined,
      url: `${baseUrl}/${page.slug}`,
      images: page.image ? [{ url: page.image, alt: page.imageAlt || page.title }] : undefined,
      type: 'website',
      ...otherMetadata,
    },
  };
}

// 2. COMPONENTE DE PÁGINA CORINGA
export default async function DynamicCoringaPage({ params }: Props) {
  const { slug } = await params;

  // Verifica redirecionamento 301
  const redirectEntry = await prisma.redirect.findUnique({
    where: { oldSlug: slug },
  });

  if (redirectEntry) {
    // Redireciona permanentemente (Status 301)
    permanentRedirect(`/${redirectEntry.newSlug}`);
  }

  // Busca a página
  const page = await prisma.page.findUnique({
    where: { slug },
  });

  // Se não existir ou não estiver publicada, 404
  if (!page || !page.published) {
    notFound();
  }

  const settings = await prisma.systemSetting.findFirst();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-x-hidden">
      {/* ===================== NAVBAR ===================== */}
      <NavbarClient logoUrl={settings?.logoUrl} siteTitle={settings?.siteTitle} />

      {/* ===================== CONTEÚDO PRINCIPAL ===================== */}
      <main className="flex-1 py-12 md:py-20 bg-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header do artigo/página */}
          <header className="mb-10 text-center md:text-left space-y-4">
            {page.h1 ? (
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight leading-tight">
                {page.h1}
              </h1>
            ) : (
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight leading-tight">
                {page.title}
              </h1>
            )}
            <hr className="border-slate-200" />
          </header>

          {/* Imagem em destaque se houver */}
          {page.image && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
              <img 
                src={page.image} 
                alt={page.imageAlt || page.title}
                className="w-full h-auto object-cover max-h-[450px]"
              />
            </div>
          )}

          {/* Conteúdo HTML Dinâmico renderizado de forma limpa */}
          <div 
            className="prose prose-slate dark:prose-invert max-w-none 
              prose-headings:text-[#243b56] prose-headings:font-extrabold 
              prose-p:leading-relaxed prose-p:text-slate-600 prose-p:text-base
              prose-a:text-blue-600 prose-a:font-semibold hover:prose-a:underline
              prose-strong:text-[#243b56] prose-strong:font-bold
              prose-ul:list-disc prose-ol:list-decimal"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          {/* JSON-LD Dinâmico para SEO estruturado (Schema.org) */}
          {page.jsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: page.jsonLd }}
            />
          )}
        </article>
      </main>

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

            {/* Copyright */}
            <p className="text-xs text-slate-500 text-center md:text-right">
              © {new Date().getFullYear()} Detetive Buscas. Inteligência de dados e background check.
            </p>
          </div>

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

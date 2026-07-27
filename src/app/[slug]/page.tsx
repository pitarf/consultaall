import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import NavbarClient from '@/components/NavbarClient';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Search, ChevronRight, Home } from 'lucide-react';
import ClientScriptExecutor from '@/components/ClientScriptExecutor';

interface Props {
  params: Promise<{ slug: string }>;
}

interface ParsedHtml {
  bodyContent: string;
  styles: string[];
  scripts: string[];
}

// Helper para extrair body, styles e scripts de um HTML completo no servidor
function parseHtmlPage(html: string): ParsedHtml {
  const styles: string[] = [];
  const scripts: string[] = [];

  // 1. Extrai conteúdo de todas as tags <style>
  let cleanHtml = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
    if (css.trim()) styles.push(css.trim());
    return '';
  });

  // 2. Extrai conteúdo de todas as tags <script>
  cleanHtml = cleanHtml.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (match, js) => {
    if (js.trim()) scripts.push(js.trim());
    return '';
  });

  // 3. Extrai o conteúdo do <body> se houver
  let bodyContent = cleanHtml;
  const bodyMatch = cleanHtml.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  }

  // 4. Remove outras tags estruturais
  bodyContent = bodyContent
    .replace(/<\/?(html|head|title|meta|link|canonical|!doctype)\b[^>]*>/gi, '')
    .trim();

  return {
    bodyContent,
    styles,
    scripts
  };
}

// Helper para verificar se a página deve ser considerada rascunho (não publicada ou agendada para o futuro)
function isPageDraft(page: any) {
  if (!page) return true;
  if (!page.published) return true;
  if (page.publishedAt && new Date(page.publishedAt) > new Date()) return true;
  return false;
}

// 1. GERAÇÃO DE METADADOS DINÂMICOS (OpenGraph e Twitter Cards completos)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Verifica se há um redirecionamento cadastrado primeiro
  const redirect = await prisma.redirect.findUnique({ where: { oldSlug: slug } });
  if (redirect) return {};

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || isPageDraft(page)) {
    return {
      title: 'Página não encontrada',
      robots: 'noindex, nofollow',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://detetivebuscas.com.br';
  const canonicalUrl = page.canonical || `${baseUrl}/${page.slug}`;

  // Processa Open Graph
  let extraOg: any = {};
  if (page.openGraph) {
    try {
      extraOg = JSON.parse(page.openGraph);
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
      follow: true, // Garante que robôs sigam links internos mesmo em noindex (noindex, follow)
    },
    openGraph: {
      title: page.title,
      description: page.metaDescription || undefined,
      url: `${baseUrl}/${page.slug}`,
      images: page.image ? [{ url: page.image, alt: page.imageAlt || page.title }] : undefined,
      type: 'website',
      ...extraOg,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.metaDescription || undefined,
      images: page.image ? [page.image] : undefined,
    }
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
    permanentRedirect(`/${redirectEntry.newSlug}`);
  }

  // Busca a página e as configurações em paralelo
  const [page, settings, menuPages] = await Promise.all([
    prisma.page.findUnique({ where: { slug } }),
    prisma.systemSetting.findFirst(),
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

  // Se não existir ou estiver em rascunho/agendada, 404
  if (!page || isPageDraft(page)) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://detetivebuscas.com.br';

  // 3. SCHEMA.ORG AUTOMÁTICO (WebPage, Service se for comercial, e BreadcrumbList)
  const schemas: any[] = [];

  // Breadcrumb Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": page.title,
        "item": `${baseUrl}/${page.slug}`
      }
    ]
  });

  // WebPage Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${baseUrl}/${page.slug}#webpage`,
    "url": `${baseUrl}/${page.slug}`,
    "name": page.title,
    "description": page.metaDescription || page.title,
    "breadcrumb": `${baseUrl}/${page.slug}#breadcrumb`
  });

  // Service Schema (se for página comercial com palavra 'consulta')
  if (page.slug.includes('consulta') || page.slug.includes('background-check')) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Consulta Cadastral e Inteligência de Dados",
      "provider": {
        "@type": "Organization",
        "name": settings?.siteTitle?.split(' - ')[0] || "Detetive Buscas",
        "url": baseUrl
      },
      "name": page.title,
      "description": page.metaDescription || page.title
    });
  }

  const { bodyContent, styles, scripts } = parseHtmlPage(page.content);
  const isCustomLandingPage = styles.length > 0 || page.content.includes('<style>');

  if (isCustomLandingPage) {
    return (
      <div className="w-full min-h-screen bg-background antialiased overflow-x-hidden">
        {/* Estilos embutidos renderizados nativamente */}
        {styles.map((css, idx) => (
          <style key={`custom-css-${idx}`} dangerouslySetInnerHTML={{ __html: css }} />
        ))}

        {/* Renderiza apenas o conteúdo do body customizado completo */}
        <div dangerouslySetInnerHTML={{ __html: bodyContent }} />

        {/* Executador de scripts reais e ligador de comportamentos */}
        <ClientScriptExecutor scripts={scripts} />

        {/* Schemas Auto-gerados (SEO) */}
        {schemas.map((schema, index) => (
          <script
            key={`schema-auto-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        {/* Schema JSON-LD Extra (Manual do Admin) */}
        {page.jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: page.jsonLd }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-x-hidden">
      {/* ===================== NAVBAR ===================== */}
      <NavbarClient logoUrl={settings?.logoUrl} siteTitle={settings?.siteTitle} menuPages={menuPages} />

      {/* ===================== CONTEÚDO PRINCIPAL ===================== */}
      <main className="flex-1 py-10 bg-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Navegação Breadcrumb Física (HTML) */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8 border-b border-slate-100 pb-4">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              Início
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-600 truncate max-w-[250px]">
              {page.title.split(' - ')[0]}
            </span>
          </nav>

          {/* Header do artigo/página */}
          <header className="mb-8 text-center md:text-left space-y-4">
            {page.h1 ? (
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight leading-tight">
                {page.h1}
              </h1>
            ) : (
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight leading-tight">
                {page.title}
              </h1>
            )}
            {page.excerpt && (
              <p className="text-slate-500 text-lg leading-relaxed pt-2">
                {page.excerpt}
              </p>
            )}
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

          {/* Schemas Auto-gerados */}
          {schemas.map((schema, index) => (
            <script
              key={`schema-auto-${index}`}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
          ))}

          {/* Schema JSON-LD Extra (Manual do Admin) */}
          {page.jsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: page.jsonLd }}
            />
          )}
        </article>
      </main>

      {/* ===================== FOOTER ===================== */}
      <Footer logoUrl={settings?.logoUrl} />
    </div>
  );
}

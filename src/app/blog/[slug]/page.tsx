import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import NavbarClient from '@/components/NavbarClient';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Tag, Search, ArrowRight, ChevronRight, Home } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

// Helper para verificar se o artigo está em rascunho ou agendado para o futuro
function isArticleDraft(article: any) {
  if (!article) return true;
  if (!article.published) return true;
  if (article.publishedAt && new Date(article.publishedAt) > new Date()) return true;
  return false;
}

// 1. METADADOS DINÂMICOS DO ARTIGO (OG + Twitter Cards)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Verifica redirecionamento
  const redirect = await prisma.redirect.findUnique({
    where: { oldSlug: slug, type: 'ARTICLE' }
  });
  if (redirect) return {};

  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || isArticleDraft(article)) {
    return {
      title: 'Artigo não encontrado',
      robots: 'noindex, nofollow',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://detetivebuscas.com.br';
  const canonicalUrl = article.canonical || `${baseUrl}/blog/${article.slug}`;

  let extraOg = {};
  if (article.openGraph) {
    try {
      extraOg = JSON.parse(article.openGraph);
    } catch (e) {
      console.error(e);
    }
  }

  return {
    title: article.title,
    description: article.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: article.robotsIndex,
      follow: true, // Garante que robôs sigam links internos mesmo em noindex (noindex, follow)
    },
    openGraph: {
      title: article.title,
      description: article.metaDescription || undefined,
      url: `${baseUrl}/blog/${article.slug}`,
      images: article.image ? [{ url: article.image, alt: article.imageAlt || article.title }] : undefined,
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author],
      ...extraOg,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.metaDescription || undefined,
      images: article.image ? [article.image] : undefined,
    }
  };
}

// 2. COMPONENTE RENDERIZADOR DO ARTIGO COMPLETO
export default async function BlogArticleDetailPage({ params }: Props) {
  const { slug } = await params;

  // Verifica se o slug foi redirecionado
  const redirectEntry = await prisma.redirect.findUnique({
    where: { oldSlug: slug, type: 'ARTICLE' },
  });

  if (redirectEntry) {
    permanentRedirect(`/blog/${redirectEntry.newSlug}`);
  }

  // Busca o artigo e as configurações em paralelo
  const [article, settings, menuPages] = await Promise.all([
    prisma.article.findUnique({
      where: { slug },
      include: { category: true }
    }),
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

  if (!article || isArticleDraft(article)) {
    notFound();
  }

  // Busca artigos relacionados/recomendados (mesma categoria, limit 3)
  const relatedArticles = await prisma.article.findMany({
    where: {
      published: true,
      categoryId: article.categoryId,
      id: { not: article.id },
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: new Date() } }
      ]
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://detetivebuscas.com.br';
  const logoUrl = settings?.logoUrl || `${baseUrl}/logo.webp`;

  // Schemas Automáticos (BlogPosting e BreadcrumbList)
  const schemas: any[] = [];

  // BreadcrumbList Schema
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
        "name": "Blog",
        "item": `${baseUrl}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `${baseUrl}/blog/${article.slug}`
      }
    ]
  });

  // BlogPosting Schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${article.slug}`
    },
    "headline": article.title,
    "description": article.metaDescription || article.title,
    "image": article.image || logoUrl,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": settings?.siteTitle?.split(' - ')[0] || "Detetive Buscas",
      "logo": {
        "@type": "ImageObject",
        "url": logoUrl
      }
    },
    "datePublished": article.createdAt.toISOString(),
    "dateModified": article.updatedAt.toISOString()
  });

  const formattedDate = new Date(article.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formattedUpdateDate = new Date(article.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-x-hidden">
      {/* ===================== NAVBAR ===================== */}
      <NavbarClient logoUrl={settings?.logoUrl} siteTitle={settings?.siteTitle} menuPages={menuPages} />

      {/* ===================== ARTICLE CONTAINER ===================== */}
      <main className="flex-1 py-10 bg-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Navegação Breadcrumb Física (HTML) */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8 border-b border-slate-100 pb-4">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5" />
              Início
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link href="/blog" className="hover:text-blue-600 transition-colors">
              Blog
            </Link>
            {article.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-500 font-semibold">{article.category.name}</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-600 truncate max-w-[200px]">
              {article.title}
            </span>
          </nav>

          {/* Link voltar */}
          <div className="mb-6">
            <Link 
              href="/blog" 
              className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors w-fit group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Voltar para o Blog
            </Link>
          </div>

          {/* Header do Artigo */}
          <header className="mb-10 space-y-4">
            {article.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/50 text-[#2872fa] text-[10px] font-extrabold uppercase tracking-wide">
                <Tag className="w-3 h-3" />
                {article.category.name}
              </span>
            )}

            {article.h1 ? (
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight leading-tight">
                {article.h1}
              </h1>
            ) : (
              <h1 className="text-3xl md:text-5xl font-extrabold text-[#243b56] tracking-tight leading-tight">
                {article.title}
              </h1>
            )}

            {article.excerpt && (
              <p className="text-slate-500 text-lg leading-relaxed pt-2">
                {article.excerpt}
              </p>
            )}

            {/* Autor e Datas */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 uppercase text-xs">
                  {article.author.slice(0, 2)}
                </div>
                Por <strong>{article.author}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                Publicado em {formattedDate}
              </span>
              {article.createdAt.getTime() !== article.updatedAt.getTime() && (
                <span className="text-xs text-slate-400 italic">
                  (Atualizado em {formattedUpdateDate})
                </span>
              )}
            </div>
          </header>

          {/* Imagem do Artigo */}
          {article.image && (
            <div className="mb-12 rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
              <img 
                src={article.image} 
                alt={article.imageAlt || article.title}
                className="w-full h-auto object-cover max-h-[480px]"
              />
            </div>
          )}

          {/* Conteúdo HTML Rico */}
          <div 
            className="prose prose-slate dark:prose-invert max-w-none 
              prose-headings:text-[#243b56] prose-headings:font-extrabold 
              prose-p:leading-relaxed prose-p:text-slate-600 prose-p:text-base
              prose-a:text-blue-600 prose-a:font-semibold hover:prose-a:underline
              prose-strong:text-[#243b56] prose-strong:font-bold
              prose-ul:list-disc prose-ol:list-decimal"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Schemas Auto-gerados */}
          {schemas.map((schema, index) => (
            <script
              key={`schema-auto-${index}`}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
          ))}

          {/* Artigo JSON-LD Customizado */}
          {article.jsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: article.jsonLd }}
            />
          )}

        </article>
      </main>

      {/* ===================== ARTIGOS RELACIONADOS ===================== */}
      {relatedArticles.length > 0 && (
        <section className="bg-slate-50 border-t border-b border-slate-200 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h3 className="text-2xl font-bold text-[#243b56] mb-8">Artigos Relacionados</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <div key={rel.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-3">
                    {rel.category && (
                      <span className="text-[10px] font-extrabold text-blue-600 uppercase">
                        {rel.category.name}
                      </span>
                    )}
                    <h4 className="font-bold text-slate-800 text-base leading-snug line-clamp-2">
                      <Link href={`/blog/${rel.slug}`} className="hover:text-blue-600">
                        {rel.title}
                      </Link>
                    </h4>
                  </div>
                  <Link 
                    href={`/blog/${rel.slug}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-4"
                  >
                    Ler artigo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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

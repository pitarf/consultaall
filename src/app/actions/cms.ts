'use server';

import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

// Helper de segurança
async function checkAdmin() {
  const session = await verifySession();
  if (!session) throw new Error('Não autenticado');
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== 'ADMIN') throw new Error('Acesso negado');
  return user;
}

// 1. SANITIZAÇÃO DE HTML (Bloqueia scripts, head, title, meta, canonical, html, body)
function sanitizeHtmlContent(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> totalmente
    .replace(/<\/?(html|body|head|title|meta|link|canonical)\b[^>]*>/gi, '') // Remove tags banidas
    .replace(/on\w+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi, ''); // Remove inline event handlers (onerror, onload, etc.)
}

// 2. NORMALIZAÇÃO DE SLUG (Remove acentos, espaços e maiúsculas)
function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9-_/]/g, '') // Permite apenas alfanuméricos, hífen, underline e barra
    .replace(/\s+/g, '-') // Espaços para hífen (caso passe algum)
    .replace(/-+/g, '-') // Evita múltiplos hífens seguidos
    .replace(/^\/+|\/+$/g, ''); // Limpa barras no início e no fim
}

// Lista de rotas reservadas do sistema que não podem ser sobrescritas por páginas
const RESERVED_SLUGS = [
  'admin', 'admin-login', 'api', 'dashboard', 'login', 'cadastro', 'esqueceu-senha', 
  'resetar-senha', 'termos', 'protecao-de-dados', 'blog', 'faturas', 'historico', 
  'empresas', 'veiculos', 'perfil', 'promocoes', 'sw.js', 'sitemap.xml', 'robots.txt'
];

// ==========================================
// 3. GERENCIADOR DE PÁGINAS (CMS)
// ==========================================

export async function getPages() {
  await checkAdmin();
  return prisma.page.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getPageBySlug(slug: string) {
  return prisma.page.findFirst({
    where: { slug }
  });
}

export async function createPage(data: {
  slug: string;
  title: string;
  metaDescription?: string | null;
  h1?: string | null;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  imageAlt?: string | null;
  canonical?: string | null;
  robotsIndex: boolean;
  showInMenu: boolean;
  showInFooter: boolean;
  jsonLd?: string | null;
  openGraph?: string | null;
  published: boolean;
  publishedAt?: string | null; // Recebe string ISO do client
}) {
  await checkAdmin();
  
  const cleanSlug = normalizeSlug(data.slug);

  if (RESERVED_SLUGS.includes(cleanSlug)) {
    return { error: 'Este slug é uma rota reservada do sistema e não pode ser utilizada.' };
  }

  // Valida duplicidade
  const existing = await prisma.page.findUnique({ where: { slug: cleanSlug } });
  if (existing) return { error: 'Uma página com este slug já existe.' };

  const sanitizedContent = sanitizeHtmlContent(data.content);

  try {
    const page = await prisma.page.create({
      data: {
        ...data,
        slug: cleanSlug,
        content: sanitizedContent,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null
      }
    });

    revalidatePath('/sitemap.xml');
    revalidatePath('/[slug]');
    revalidatePath('/');
    return { success: true, page };
  } catch (err: any) {
    console.error('Erro ao criar página:', err);
    return { error: 'Erro interno ao criar página.' };
  }
}

export async function updatePage(id: string, data: {
  slug: string;
  title: string;
  metaDescription?: string | null;
  h1?: string | null;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  imageAlt?: string | null;
  canonical?: string | null;
  robotsIndex: boolean;
  showInMenu: boolean;
  showInFooter: boolean;
  jsonLd?: string | null;
  openGraph?: string | null;
  published: boolean;
  publishedAt?: string | null;
}) {
  await checkAdmin();

  const cleanSlug = normalizeSlug(data.slug);

  if (RESERVED_SLUGS.includes(cleanSlug)) {
    return { error: 'Este slug é uma rota reservada do sistema e não pode ser utilizada.' };
  }

  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return { error: 'Página não encontrada.' };

  // Valida duplicidade se o slug mudou
  if (page.slug !== cleanSlug) {
    const existing = await prisma.page.findUnique({ where: { slug: cleanSlug } });
    if (existing) return { error: 'Uma página com este slug já existe.' };

    // Criar redirecionamento 301
    await create301Redirect(page.slug, cleanSlug, 'PAGE');
  }

  const sanitizedContent = sanitizeHtmlContent(data.content);

  try {
    await prisma.page.update({
      where: { id },
      data: {
        ...data,
        slug: cleanSlug,
        content: sanitizedContent,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null
      }
    });

    revalidatePath('/sitemap.xml');
    revalidatePath(`/${page.slug}`);
    revalidatePath(`/${cleanSlug}`);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao atualizar página:', err);
    return { error: 'Erro interno ao atualizar página.' };
  }
}

export async function duplicatePage(id: string) {
  await checkAdmin();
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return { error: 'Página não encontrada.' };

  const timestamp = Date.now();
  const newSlug = `${page.slug}-copia-${timestamp}`;
  const newTitle = `${page.title} (Cópia)`;

  try {
    const duplicated = await prisma.page.create({
      data: {
        ...page,
        id: undefined, // gera novo UUID
        slug: newSlug,
        title: newTitle,
        published: false, // duplicados começam como rascunho
        publishedAt: null,
        createdAt: undefined,
        updatedAt: undefined
      }
    });
    revalidatePath('/');
    return { success: true, page: duplicated };
  } catch (err) {
    console.error('Erro ao duplicar página:', err);
    return { error: 'Erro ao duplicar página.' };
  }
}

export async function togglePagePublish(id: string, published: boolean) {
  await checkAdmin();
  try {
    const page = await prisma.page.update({
      where: { id },
      data: { 
        published,
        publishedAt: published ? new Date() : null
      }
    });
    revalidatePath('/sitemap.xml');
    revalidatePath(`/${page.slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return { error: 'Erro ao alternar publicação da página.' };
  }
}

export async function deletePage(id: string) {
  await checkAdmin();
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return { error: 'Página não encontrada.' };

  try {
    await prisma.page.delete({ where: { id } });
    // Deleta também redirecionamentos que apontavam para ela
    await prisma.redirect.deleteMany({ where: { newSlug: page.slug } });

    revalidatePath('/sitemap.xml');
    revalidatePath(`/${page.slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Erro ao deletar página:', err);
    return { error: 'Erro ao excluir página.' };
  }
}

// ==========================================
// 4. GERENCIADOR DO BLOG
// ==========================================

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function createCategory(name: string) {
  await checkAdmin();
  const slug = name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  try {
    const category = await prisma.category.create({
      data: { name, slug }
    });
    return { success: true, category };
  } catch (err) {
    return { error: 'Categoria já existe.' };
  }
}

export async function deleteCategory(id: string) {
  await checkAdmin();
  try {
    await prisma.category.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    return { error: 'Erro ao deletar categoria. Certifique-se de que não há artigos nela.' };
  }
}

export async function getArticles(onlyPublished = false) {
  const now = new Date();
  return prisma.article.findMany({
    where: onlyPublished 
      ? { 
          published: true,
          OR: [
            { publishedAt: null },
            { publishedAt: { lte: now } } // Programado para publicação
          ]
        } 
      : {},
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug },
    include: { category: true }
  });
}

export async function createArticle(data: {
  slug: string;
  title: string;
  metaDescription?: string | null;
  h1?: string | null;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  imageAlt?: string | null;
  canonical?: string | null;
  robotsIndex: boolean;
  jsonLd?: string | null;
  openGraph?: string | null;
  published: boolean;
  publishedAt?: string | null;
  author: string;
  categoryId?: string | null;
}) {
  await checkAdmin();

  const cleanSlug = normalizeSlug(data.slug);

  const existing = await prisma.article.findUnique({ where: { slug: cleanSlug } });
  if (existing) return { error: 'Um artigo com este slug já existe.' };

  const sanitizedContent = sanitizeHtmlContent(data.content);

  try {
    const article = await prisma.article.create({
      data: {
        ...data,
        slug: cleanSlug,
        content: sanitizedContent,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null
      }
    });

    revalidatePath('/sitemap.xml');
    revalidatePath('/blog');
    revalidatePath('/blog/[slug]');
    revalidatePath('/');
    return { success: true, article };
  } catch (err) {
    console.error('Erro ao criar artigo:', err);
    return { error: 'Erro ao criar artigo.' };
  }
}

export async function updateArticle(id: string, data: {
  slug: string;
  title: string;
  metaDescription?: string | null;
  h1?: string | null;
  excerpt?: string | null;
  content: string;
  image?: string | null;
  imageAlt?: string | null;
  canonical?: string | null;
  robotsIndex: boolean;
  jsonLd?: string | null;
  openGraph?: string | null;
  published: boolean;
  publishedAt?: string | null;
  author: string;
  categoryId?: string | null;
}) {
  await checkAdmin();

  const cleanSlug = normalizeSlug(data.slug);

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { error: 'Artigo não encontrado.' };

  if (article.slug !== cleanSlug) {
    const existing = await prisma.article.findUnique({ where: { slug: cleanSlug } });
    if (existing) return { error: 'Um artigo com este slug já existe.' };

    // Criar redirecionamento 301
    await create301Redirect(article.slug, cleanSlug, 'ARTICLE');
  }

  const sanitizedContent = sanitizeHtmlContent(data.content);

  try {
    await prisma.article.update({
      where: { id },
      data: {
        ...data,
        slug: cleanSlug,
        content: sanitizedContent,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null
      }
    });

    revalidatePath('/sitemap.xml');
    revalidatePath('/blog');
    revalidatePath(`/blog/${article.slug}`);
    revalidatePath(`/blog/${cleanSlug}`);
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Erro ao atualizar artigo:', err);
    return { error: 'Erro ao atualizar artigo.' };
  }
}

export async function duplicateArticle(id: string) {
  await checkAdmin();
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { error: 'Artigo não encontrado.' };

  const timestamp = Date.now();
  const newSlug = `${article.slug}-copia-${timestamp}`;
  const newTitle = `${article.title} (Cópia)`;

  try {
    const duplicated = await prisma.article.create({
      data: {
        ...article,
        id: undefined,
        slug: newSlug,
        title: newTitle,
        published: false,
        publishedAt: null,
        createdAt: undefined,
        updatedAt: undefined
      }
    });
    revalidatePath('/blog');
    return { success: true, article: duplicated };
  } catch (err) {
    console.error('Erro ao duplicar artigo:', err);
    return { error: 'Erro ao duplicar artigo.' };
  }
}

export async function toggleArticlePublish(id: string, published: boolean) {
  await checkAdmin();
  try {
    const article = await prisma.article.update({
      where: { id },
      data: { 
        published,
        publishedAt: published ? new Date() : null
      }
    });
    revalidatePath('/sitemap.xml');
    revalidatePath('/blog');
    revalidatePath(`/blog/${article.slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    return { error: 'Erro ao alternar publicação do artigo.' };
  }
}

export async function deleteArticle(id: string) {
  await checkAdmin();
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { error: 'Artigo não encontrado.' };

  try {
    await prisma.article.delete({ where: { id } });
    await prisma.redirect.deleteMany({ where: { newSlug: article.slug } });

    revalidatePath('/sitemap.xml');
    revalidatePath('/blog');
    revalidatePath(`/blog/${article.slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Erro ao deletar artigo:', err);
    return { error: 'Erro ao deletar artigo.' };
  }
}

// ==========================================
// 5. UPLOAD DE IMAGEM OTIMIZADA WEB_PREVIEW
// ==========================================

export async function saveUploadedImage(base64Data: string, originalName: string) {
  await checkAdmin();
  try {
    // Limpa metadados do base64 (ex: data:image/webp;base64,)
    const base64Matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let extension = 'webp';

    if (base64Matches) {
      buffer = Buffer.from(base64Matches[2], 'base64');
      const mime = base64Matches[1];
      if (mime.includes('png')) extension = 'png';
      else if (mime.includes('jpeg') || mime.includes('jpg')) extension = 'jpg';
      else if (mime.includes('avif')) extension = 'avif';
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    // Normaliza o nome do arquivo para evitar Path Traversal e acentos
    const cleanName = originalName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');

    const filename = `${path.parse(cleanName).name}-${Date.now()}.${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Cria diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return { success: true, url: `/uploads/${filename}` };
  } catch (err: any) {
    console.error('Erro ao salvar imagem de upload:', err);
    return { error: 'Erro interno ao salvar arquivo no servidor.' };
  }
}

// ==========================================
// 6. LOGICA AUXILIAR DE REDIRECIONAMENTOS 301
// ==========================================

async function create301Redirect(oldSlug: string, newSlug: string, type: 'PAGE' | 'ARTICLE') {
  try {
    await prisma.redirect.upsert({
      where: { oldSlug },
      update: { newSlug, type },
      create: { oldSlug, newSlug, type }
    });

    await prisma.redirect.updateMany({
      where: { newSlug: oldSlug },
      data: { newSlug }
    });
  } catch (err) {
    console.error('Erro ao processar redirecionamento 301:', err);
  }
}

export async function findRedirect(slug: string) {
  return prisma.redirect.findUnique({
    where: { oldSlug: slug }
  });
}

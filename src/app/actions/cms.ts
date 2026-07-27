'use server';

import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper de segurança
async function checkAdmin() {
  const session = await verifySession();
  if (!session) throw new Error('Não autenticado');
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== 'ADMIN') throw new Error('Acesso negado');
  return user;
}

// ==========================================
// 1. GERENCIADOR DE PÁGINAS (CMS)
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
  content: string;
  image?: string | null;
  imageAlt?: string | null;
  canonical?: string | null;
  robotsIndex: boolean;
  jsonLd?: string | null;
  openGraph?: string | null;
  published: boolean;
}) {
  await checkAdmin();
  
  // Limpa o slug
  const cleanSlug = data.slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');

  // Valida duplicidade
  const existing = await prisma.page.findUnique({ where: { slug: cleanSlug } });
  if (existing) return { error: 'Uma página com este slug já existe.' };

  try {
    const page = await prisma.page.create({
      data: {
        ...data,
        slug: cleanSlug
      }
    });

    revalidatePath('/sitemap.xml');
    revalidatePath('/[slug]');
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
  content: string;
  image?: string | null;
  imageAlt?: string | null;
  canonical?: string | null;
  robotsIndex: boolean;
  jsonLd?: string | null;
  openGraph?: string | null;
  published: boolean;
}) {
  await checkAdmin();

  const cleanSlug = data.slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');

  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return { error: 'Página não encontrada.' };

  // Valida duplicidade se o slug mudou
  if (page.slug !== cleanSlug) {
    const existing = await prisma.page.findUnique({ where: { slug: cleanSlug } });
    if (existing) return { error: 'Uma página com este slug já existe.' };

    // Criar redirecionamento 301
    await create301Redirect(page.slug, cleanSlug, 'PAGE');
  }

  try {
    await prisma.page.update({
      where: { id },
      data: {
        ...data,
        slug: cleanSlug
      }
    });

    revalidatePath('/sitemap.xml');
    revalidatePath(`/${page.slug}`);
    revalidatePath(`/${cleanSlug}`);
    return { success: true };
  } catch (err: any) {
    console.error('Erro ao atualizar página:', err);
    return { error: 'Erro interno ao atualizar página.' };
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
    return { success: true };
  } catch (err) {
    console.error('Erro ao deletar página:', err);
    return { error: 'Erro ao excluir página.' };
  }
}

// ==========================================
// 2. GERENCIADOR DO BLOG
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
  return prisma.article.findMany({
    where: onlyPublished ? { published: true } : {},
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
  content: string;
  image?: string | null;
  imageAlt?: string | null;
  canonical?: string | null;
  robotsIndex: boolean;
  jsonLd?: string | null;
  openGraph?: string | null;
  published: boolean;
  author: string;
  categoryId?: string | null;
}) {
  await checkAdmin();

  const cleanSlug = data.slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');

  const existing = await prisma.article.findUnique({ where: { slug: cleanSlug } });
  if (existing) return { error: 'Um artigo com este slug já existe.' };

  try {
    const article = await prisma.article.create({
      data: {
        ...data,
        slug: cleanSlug
      }
    });

    revalidatePath('/sitemap.xml');
    revalidatePath('/blog');
    revalidatePath('/blog/[slug]');
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
  content: string;
  image?: string | null;
  imageAlt?: string | null;
  canonical?: string | null;
  robotsIndex: boolean;
  jsonLd?: string | null;
  openGraph?: string | null;
  published: boolean;
  author: string;
  categoryId?: string | null;
}) {
  await checkAdmin();

  const cleanSlug = data.slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { error: 'Artigo não encontrado.' };

  if (article.slug !== cleanSlug) {
    const existing = await prisma.article.findUnique({ where: { slug: cleanSlug } });
    if (existing) return { error: 'Um artigo com este slug já existe.' };

    // Criar redirecionamento 301
    await create301Redirect(article.slug, cleanSlug, 'ARTICLE');
  }

  try {
    await prisma.article.update({
      where: { id },
      data: {
        ...data,
        slug: cleanSlug
      }
    });

    revalidatePath('/sitemap.xml');
    revalidatePath('/blog');
    revalidatePath(`/blog/${article.slug}`);
    revalidatePath(`/blog/${cleanSlug}`);
    return { success: true };
  } catch (err) {
    console.error('Erro ao atualizar artigo:', err);
    return { error: 'Erro ao atualizar artigo.' };
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
    return { success: true };
  } catch (err) {
    console.error('Erro ao deletar artigo:', err);
    return { error: 'Erro ao deletar artigo.' };
  }
}

// ==========================================
// 3. LOGICA AUXILIAR DE REDIRECIONAMENTOS 301
// ==========================================

async function create301Redirect(oldSlug: string, newSlug: string, type: 'PAGE' | 'ARTICLE') {
  try {
    // 1. Cria o redirecionamento
    await prisma.redirect.upsert({
      where: { oldSlug },
      update: { newSlug, type },
      create: { oldSlug, newSlug, type }
    });

    // 2. Atualiza os redirecionamentos em cadeia
    // Se havia um redirecionamento "/a" -> "/b", e agora mudamos "/b" -> "/c",
    // atualizamos para "/a" -> "/c" diretamente para evitar múltiplos saltos (redirect chain)
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

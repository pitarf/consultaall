import { getArticles, getCategories } from '@/app/actions/cms';
import GerenciadorBlog from './GerenciadorBlog';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const [articles, categories] = await Promise.all([
    getArticles(),
    getCategories()
  ]);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <BookOpen className="text-blue-500 w-8 h-8" />
          Gerenciador de Blog & Conteúdo
        </h1>
        <p className="text-slate-500 dark:text-gray-400 mt-2">
          Publique artigos, crie categorias de postagens, gerencie autores, datas e configure a otimização de busca para os seus conteúdos.
        </p>
      </div>

      <GerenciadorBlog initialArticles={articles} initialCategories={categories} />
    </div>
  );
}

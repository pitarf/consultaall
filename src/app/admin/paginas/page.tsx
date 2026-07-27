import { getPages } from '@/app/actions/cms';
import GerenciadorPaginas from './GerenciadorPaginas';
import { FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPaginasPage() {
  const pages = await getPages();

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" />
          Gerenciador de Páginas SEO
        </h1>
        <p className="text-slate-500 dark:text-gray-400 mt-2">
          Crie, edite e otimize páginas comerciais ou institucionais com controle completo de indexação e tags canônicas.
        </p>
      </div>

      <GerenciadorPaginas initialPages={pages} />
    </div>
  );
}

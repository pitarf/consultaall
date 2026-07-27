'use client';

import { useState } from 'react';
import { 
  createArticle, updateArticle, deleteArticle, createCategory, deleteCategory 
} from '@/app/actions/cms';
import { toast } from 'sonner';
import { 
  Plus, Search, Edit2, Trash2, X, HelpCircle, Save, Loader2, Sparkles, FolderPlus, BookOpen, User, Calendar, ExternalLink
} from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';

interface GerenciadorBlogProps {
  initialArticles: any[];
  initialCategories: any[];
}

export default function GerenciadorBlog({ initialArticles, initialCategories }: GerenciadorBlogProps) {
  const [articles, setArticles] = useState<any[]>(initialArticles);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);

  // Estados do artigo
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [h1, setH1] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [canonical, setCanonical] = useState('');
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [jsonLd, setJsonLd] = useState('');
  const [openGraph, setOpenGraph] = useState('');
  const [published, setPublished] = useState(false);
  const [author, setAuthor] = useState('Redação');
  const [categoryId, setCategoryId] = useState('');

  // Estado de criação de categoria
  const [newCategoryName, setNewCategoryName] = useState('');

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingArticle(null);
    setTitle('');
    setSlug('');
    setH1('');
    setMetaDescription('');
    setContent(`<h2>Título do Artigo</h2>\n<p>Escreva o conteúdo do seu artigo aqui em formato HTML...</p>`);
    setImage('');
    setImageAlt('');
    setCanonical('');
    setRobotsIndex(true);
    setJsonLd('');
    setOpenGraph('');
    setPublished(true);
    setAuthor('Redação');
    setCategoryId(categories[0]?.id || '');
    setModalOpen(true);
  };

  const openEditModal = (article: any) => {
    setEditingArticle(article);
    setTitle(article.title);
    setSlug(article.slug);
    setH1(article.h1 || '');
    setMetaDescription(article.metaDescription || '');
    setContent(article.content);
    setImage(article.image || '');
    setImageAlt(article.imageAlt || '');
    setCanonical(article.canonical || '');
    setRobotsIndex(article.robotsIndex);
    setJsonLd(article.jsonLd || '');
    setOpenGraph(article.openGraph || '');
    setPublished(article.published);
    setAuthor(article.author || 'Redação');
    setCategoryId(article.categoryId || '');
    setModalOpen(true);
  };

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      toast.error('Preencha os campos obrigatórios: Título, Slug e Conteúdo.');
      return;
    }

    setLoading(true);
    const data = {
      title,
      slug,
      h1: h1 || null,
      metaDescription: metaDescription || null,
      content,
      image: image || null,
      imageAlt: imageAlt || null,
      canonical: canonical || null,
      robotsIndex,
      jsonLd: jsonLd || null,
      openGraph: openGraph || null,
      published,
      author,
      categoryId: categoryId || null
    };

    try {
      if (editingArticle) {
        const res = await updateArticle(editingArticle.id, data);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success('Artigo atualizado com sucesso!');
          setArticles(articles.map(a => a.id === editingArticle.id ? { ...a, ...data, category: categories.find(c => c.id === categoryId), updatedAt: new Date() } : a));
          setModalOpen(false);
        }
      } else {
        const res = await createArticle(data);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success('Artigo criado com sucesso!');
          if (res.article) {
            setArticles([{ ...res.article, category: categories.find(c => c.id === categoryId) }, ...articles]);
          }
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error('Erro ao salvar artigo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id: string, articleTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente o artigo "${articleTitle}"?`)) return;

    setLoading(true);
    try {
      const res = await deleteArticle(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Artigo excluído com sucesso!');
        setArticles(articles.filter(a => a.id !== id));
      }
    } catch (err) {
      toast.error('Erro ao excluir artigo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      const res = await createCategory(newCategoryName.trim());
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Categoria criada com sucesso!');
        if (res.category) setCategories([...categories, res.category]);
        setNewCategoryName('');
      }
    } catch (err) {
      toast.error('Erro ao criar categoria.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, categoryName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"? Artigos vinculados a ela ficarão "Sem Categoria".`)) return;

    setLoading(true);
    try {
      const res = await deleteCategory(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Categoria excluída!');
        setCategories(categories.filter(c => c.id !== id));
        // Atualiza artigos locais sem categoria
        setArticles(articles.map(a => a.categoryId === id ? { ...a, categoryId: null, category: null } : a));
      }
    } catch (err) {
      toast.error('Erro ao excluir categoria.');
    } finally {
      setLoading(false);
    }
  };

  const handleSlugBlur = () => {
    if (!slug && title) {
      const formatted = title.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(formatted);
    }
  };

  return (
    <>
      {/* Abas */}
      <div className="flex border-b border-slate-200 dark:border-white/10 mb-8 gap-4">
        <button
          onClick={() => setActiveTab('articles')}
          className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'articles' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Artigos do Blog ({articles.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'categories' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Categorias ({categories.length})
        </button>
      </div>

      {activeTab === 'articles' ? (
        <>
          {/* Barra de Busca de Artigos */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative flex-grow max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Pesquisar por título ou slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all shadow-sm"
              />
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-blue-500/10 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              Novo Artigo
            </button>
          </div>

          {/* Tabela de Artigos */}
          <div className="glass-panel rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-card shadow-sm hover:shadow-md transition-all">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-gray-300">
                <thead className="bg-slate-50 dark:bg-black/40 text-xs uppercase text-slate-500 dark:text-gray-500 font-bold border-b border-slate-200 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4">Artigo</th>
                    <th className="px-6 py-4">Autor / Categoria</th>
                    <th className="px-6 py-4">Slug (URL)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Publicação</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-transparent dark:bg-black/10">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-gray-500">
                        Nenhum artigo cadastrado ou encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-white leading-tight">
                              {article.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-xs">
                            <span className="text-slate-700 dark:text-gray-300 font-medium flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {article.author}
                            </span>
                            <span className="text-blue-500 dark:text-blue-400 font-semibold mt-0.5">
                              {article.category?.name || 'Sem Categoria'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                          /blog/{article.slug}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            article.published 
                              ? 'bg-emerald-500/20 text-emerald-600' 
                              : 'bg-amber-500/20 text-amber-600'
                          }`}>
                            {article.published ? 'PUBLICADO' : 'RASCUNHO'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-gray-400 whitespace-nowrap text-xs">
                          {new Date(article.createdAt).toLocaleDateString('pt-BR')} às {new Date(article.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          <a 
                            href={`/blog/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors inline-flex"
                            title="Ver Artigo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => openEditModal(article)}
                            disabled={loading}
                            className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white rounded transition-colors inline-flex"
                            title="Editar Artigo"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteArticle(article.id, article.title)}
                            disabled={loading}
                            className="p-2 bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors inline-flex"
                            title="Excluir Artigo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Aba de Categorias */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Formulário Criar Categoria */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card self-start shadow-sm">
            <h3 className="text-sm font-bold text-[#243b56] dark:text-white mb-4 uppercase tracking-widest flex items-center gap-2">
              <FolderPlus className="text-blue-500 w-5 h-5" />
              Nova Categoria
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Nome da Categoria</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: LGPD, Veículos, Dicas..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                {loading ? 'Criando...' : 'Adicionar Categoria'}
              </button>
            </form>
          </div>

          {/* Listagem de Categorias */}
          <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card shadow-sm">
            <h3 className="text-sm font-bold text-[#243b56] dark:text-white mb-4 uppercase tracking-widest">Lista de Categorias</h3>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {categories.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-sm">Nenhuma categoria cadastrada.</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{cat.name}</h4>
                      <p className="text-xs font-mono text-slate-400">Slug: /blog/categoria/{cat.slug}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      disabled={loading}
                      className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                      title="Excluir Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar/Editar Artigo */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#243b56] dark:text-white flex items-center gap-2">
                <BookOpen className="text-blue-500 w-5 h-5" />
                {editingArticle ? 'Editar Artigo de Blog' : 'Criar Novo Artigo'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmitArticle} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Título e Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">Título do Artigo (Meta Title) *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSlugBlur}
                    required
                    placeholder="Ex: Como evitar golpes por consulta cadastral"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    Slug da URL *
                    <Tooltip content="O endereço final do post do blog. Ex: como-evitar-golpes" />
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-400 font-mono text-xs select-none">
                      /blog/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      required
                      placeholder="como-evitar-golpes"
                      className="w-full px-4 py-3 rounded-r-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* H1 Principal */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  Título Principal H1 (Título Interno do Corpo do Artigo)
                  <Tooltip content="Se deixado em branco, o título acima será usado como H1." />
                </label>
                <input
                  type="text"
                  value={h1}
                  onChange={(e) => setH1(e.target.value)}
                  placeholder="Ex: Saiba Como se Proteger de Fraudes Usando Consultas de CPF"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                />
              </div>

              {/* Autor e Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">Autor do Artigo *</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                    placeholder="Redação"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">Categoria *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                  >
                    <option value="">Selecione uma Categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">Meta Description (Resumo para o Google) *</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                  maxLength={160}
                  placeholder="Escreva uma descrição atraente de até 160 caracteres..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all resize-none"
                />
                <span className="text-[10px] text-slate-400 dark:text-gray-500 flex justify-end font-mono mt-1">
                  {metaDescription.length}/160 caracteres
                </span>
              </div>

              {/* Conteúdo HTML Rico */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  Conteúdo do Artigo (Suporta Tags HTML) *
                  <Tooltip content="Escreva seu artigo completo usando tags HTML básicas para formatação (ex: <h2>, <p>, <ul>, etc.)" />
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  required
                  placeholder="<h2>Título</h2><p>Escreva o conteúdo aqui...</p>"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-y"
                />
              </div>

              {/* Imagem e ALT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">URL da Imagem do Post / Destaque</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Ex: /images/post-seguranca.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">ALT da Imagem (SEO)</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Ex: Homem de terno pesquisando dados em um laptop"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              {/* Configurações de SEO avançado do Artigo */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-6 space-y-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="text-amber-500 w-4.5 h-4.5" />
                  SEO Avançado & Configurações de Metatags do Artigo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      URL Canonical Personalizada
                      <Tooltip content="Se deixado em branco, o sistema preencherá automaticamente com a própria URL do post (autorreferente)." />
                    </label>
                    <input
                      type="text"
                      value={canonical}
                      onChange={(e) => setCanonical(e.target.value)}
                      placeholder="Autopreenchido com a própria URL"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">Robots Indexation</label>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={() => setRobotsIndex(!robotsIndex)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${robotsIndex ? 'bg-green-500' : 'bg-red-500'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${robotsIndex ? 'left-6' : 'left-1'}`}></div>
                      </button>
                      <span className="text-xs font-bold text-slate-600 dark:text-gray-300">
                        {robotsIndex ? 'Indexar Artigo (INDEX)' : 'Ocultar do Google (NOINDEX)'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">Status de Publicação</label>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        onClick={() => setPublished(!published)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${published ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${published ? 'left-6' : 'left-1'}`}></div>
                      </button>
                      <span className="text-xs font-bold text-slate-600 dark:text-gray-300">
                        {published ? 'Disponível Online (PUBLICADO)' : 'Oculto (RASCUNHO)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Structured JSON-LD Data & OpenGraph Custom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      JSON-LD estruturado extra (Script HTML)
                      <Tooltip content="Adicione scripts adicionais do schema estruturado se necessário." />
                    </label>
                    <textarea
                      value={jsonLd}
                      onChange={(e) => setJsonLd(e.target.value)}
                      rows={4}
                      placeholder="Script de Schema JSON-LD..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      Open Graph Customizado (JSON)
                      <Tooltip content="Substitua ou acrescente tags Open Graph estruturadas em formato JSON." />
                    </label>
                    <textarea
                      value={openGraph}
                      onChange={(e) => setOpenGraph(e.target.value)}
                      rows={4}
                      placeholder="{ 'og:type': 'article' }"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                    />
                  </div>
                </div>

              </div>

            </form>

            {/* Footer com Ações */}
            <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 rounded-b-3xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-3 text-xs md:text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmitArticle}
                disabled={loading}
                className="px-6 py-3 text-xs md:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-blue-500/10 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
                {editingArticle ? 'Salvar Alterações' : 'Criar Artigo'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

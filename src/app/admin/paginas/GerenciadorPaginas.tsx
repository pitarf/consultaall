'use client';

import { useState } from 'react';
import { createPage, updatePage, deletePage } from '@/app/actions/cms';
import { toast } from 'sonner';
import { 
  Plus, Search, Edit2, Trash2, Eye, ExternalLink, X, HelpCircle, Save, Loader2, Sparkles, Check, Globe
} from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';

interface GerenciadorPaginasProps {
  initialPages: any[];
}

export default function GerenciadorPaginas({ initialPages }: GerenciadorPaginasProps) {
  const [pages, setPages] = useState<any[]>(initialPages);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any | null>(null);

  // Campos do formulário
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

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setH1('');
    setMetaDescription('');
    setContent(`<h2>Título de Seção</h2>\n<p>Escreva o conteúdo da sua página aqui em formato HTML...</p>`);
    setImage('');
    setImageAlt('');
    setCanonical('');
    setRobotsIndex(true);
    setJsonLd('');
    setOpenGraph('');
    setPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (page: any) => {
    setEditingPage(page);
    setTitle(page.title);
    setSlug(page.slug);
    setH1(page.h1 || '');
    setMetaDescription(page.metaDescription || '');
    setContent(page.content);
    setImage(page.image || '');
    setImageAlt(page.imageAlt || '');
    setCanonical(page.canonical || '');
    setRobotsIndex(page.robotsIndex);
    setJsonLd(page.jsonLd || '');
    setOpenGraph(page.openGraph || '');
    setPublished(page.published);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      published
    };

    try {
      if (editingPage) {
        // Editando
        const res = await updatePage(editingPage.id, data);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success('Página atualizada com sucesso!');
          setPages(pages.map(p => p.id === editingPage.id ? { ...p, ...data, updatedAt: new Date() } : p));
          setModalOpen(false);
        }
      } else {
        // Criando
        const res = await createPage(data);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success('Página criada com sucesso!');
          if (res.page) setPages([res.page, ...pages]);
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error('Erro ao salvar página.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, pageTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir permanentemente a página "${pageTitle}"? Isso também removerá redirecionamentos vinculados.`)) return;

    setLoading(true);
    try {
      const res = await deletePage(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Página excluída com sucesso!');
        setPages(pages.filter(p => p.id !== id));
      }
    } catch (err) {
      toast.error('Erro ao excluir página.');
    } finally {
      setLoading(false);
    }
  };

  const handleSlugBlur = () => {
    // Transforma o título em slug se estiver vazio
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
      {/* Barra superior de ações */}
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-card text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/30 text-sm transition-all shadow-sm"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-blue-500/10 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Nova Página SEO
        </button>
      </div>

      {/* Tabela de Páginas */}
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-card shadow-sm hover:shadow-md transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-gray-300">
            <thead className="bg-slate-50 dark:bg-black/40 text-xs uppercase text-slate-500 dark:text-gray-500 font-bold border-b border-slate-200 dark:border-white/5">
              <tr>
                <th className="px-6 py-4">Título / H1</th>
                <th className="px-6 py-4">Slug (URL)</th>
                <th className="px-6 py-4">Indexação</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Última Atualização</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-transparent dark:bg-black/10">
              {filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-gray-500">
                    Nenhuma página cadastrada ou encontrada.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white leading-tight">
                          {page.title}
                        </span>
                        {page.h1 && (
                          <span className="text-[10px] text-slate-400 dark:text-gray-500 font-mono mt-0.5">
                            H1: {page.h1}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                      /{page.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        page.robotsIndex 
                          ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                          : 'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}>
                        {page.robotsIndex ? 'INDEX, FOLLOW' : 'NOINDEX, NOFOLLOW'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        page.published 
                          ? 'bg-emerald-500/20 text-emerald-600' 
                          : 'bg-amber-500/20 text-amber-600'
                      }`}>
                        {page.published ? 'PUBLICADO' : 'RASCUNHO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {new Date(page.updatedAt).toLocaleDateString('pt-BR')} às {new Date(page.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <a 
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors inline-flex"
                        title="Ver no Site"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => openEditModal(page)}
                        disabled={loading}
                        className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white rounded transition-colors inline-flex"
                        title="Editar Página"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(page.id, page.title)}
                        disabled={loading}
                        className="p-2 bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors inline-flex"
                        title="Excluir Página"
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

      {/* Modal Criar/Editar Página */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-card border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl my-8 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#243b56] dark:text-white flex items-center gap-2">
                <Globe className="text-blue-500 w-5 h-5" />
                {editingPage ? 'Editar Página SEO' : 'Criar Nova Página SEO'}
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Título e Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">Título da Página (Meta Title) *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleSlugBlur}
                    required
                    placeholder="Ex: Consultar CPF Online - Rápido e Seguro"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    Slug da URL *
                    <Tooltip content="O endereço final da página. Ex: consulta-cpf" />
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-400 font-mono text-xs select-none">
                      /
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      required
                      placeholder="consulta-cpf"
                      className="w-full px-4 py-3 rounded-r-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* H1 Principal */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  Título Principal H1 (Título Interno do Corpo da Página)
                  <Tooltip content="Se deixado em branco, o meta title acima será usado como H1 principal." />
                </label>
                <input
                  type="text"
                  value={h1}
                  onChange={(e) => setH1(e.target.value)}
                  placeholder="Ex: Consulta Completa de CPF na Receita Federal"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">Meta Description (Resumo para Google) *</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                  maxLength={160}
                  placeholder="Escreva uma descrição chamativa de até 160 caracteres..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all resize-none"
                />
                <span className="text-[10px] text-slate-400 dark:text-gray-500 flex justify-end font-mono mt-1">
                  {metaDescription.length}/160 caracteres
                </span>
              </div>

              {/* Conteúdo Rico HTML */}
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  Conteúdo da Página (Suporta Tags HTML) *
                  <Tooltip content="Você pode escrever conteúdo com tags padrão como <h2>, <p>, <strong>, <ul>, etc." />
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  required
                  placeholder="<h2>Subtítulo</h2><p>Parágrafo explicativo...</p>"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-y"
                />
              </div>

              {/* Imagem e ALT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">URL da Imagem de Destaque / OpenGraph</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Ex: /images/consultacpf.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2">ALT da Imagem (Acessibilidade / SEO)</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Ex: Ilustração de uma pessoa analisando dados cadastrais"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              {/* Parâmetros avançados de SEO */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-6 space-y-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="text-amber-500 w-4.5 h-4.5" />
                  SEO Avançado & Configurações de Meta Tags
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      URL Canonical Personalizada
                      <Tooltip content="Se deixado em branco, o sistema preencherá automaticamente com a própria URL da página (autorreferente). Só preencha se desejar apontar para outra página." />
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
                        {robotsIndex ? 'Indexar no Google (INDEX)' : 'Ocultar do Google (NOINDEX)'}
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
                      JSON-LD (Structured Data Schema.org)
                      <Tooltip content="Insira o script do schema estruturado. Ex: { '@context': 'https://schema.org', '@type': 'FAQPage', ... }" />
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
                      Extra Open Graph Metadata (JSON)
                      <Tooltip content="Customizações adicionais das meta tags em formato JSON. Ex: { 'og:site_name': 'Detetive Buscas' }" />
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
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 text-xs md:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-blue-500/10 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
                {editingPage ? 'Salvar Alterações' : 'Criar Página'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

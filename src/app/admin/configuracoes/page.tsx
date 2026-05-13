'use client';

import React, { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSettings } from '@/app/actions/admin';
import { Save, Globe, MessageSquare, Loader2, Info, Image, ExternalLink, Scale } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Página de Configurações do Sistema no Painel Admin.
 * Permite alterar SEO, Branding (Logo e Favicon) e canais de suporte.
 */
export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteTitle: '',
    siteDescription: '',
    siteKeywords: '',
    supportWhatsapp: '',
    logoUrl: '',
    faviconUrl: '',
    companyName: '',
    companyCnpj: '',
    companyAddress: '',
    companyEmail: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSystemSettings();
        setSettings({
          siteTitle: data.siteTitle || '',
          siteDescription: data.siteDescription || '',
          siteKeywords: data.siteKeywords || '',
          supportWhatsapp: data.supportWhatsapp || '',
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || '',
          companyName: data.companyName || '',
          companyCnpj: data.companyCnpj || '',
          companyAddress: data.companyAddress || '',
          companyEmail: data.companyEmail || '',
        });
      } catch {
        toast.error('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateSystemSettings(settings);
      if (res.success) {
        toast.success('Configurações salvas com sucesso!');
      }
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white">Configurações do Sistema</h1>
        <p className="text-gray-400 mt-2">Gerencie a identidade visual, SEO e canais de suporte.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">

        {/* ====== BRANDING VISUAL ====== */}
        <section className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Branding Visual</h2>
              <p className="text-gray-500 text-sm">Defina a logo e o favicon do sistema via URL externa.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-400">URL da Logo</label>
              <input
                type="url"
                value={settings.logoUrl}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all text-sm"
                placeholder="https://exemplo.com/logo.png"
              />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Info className="w-3 h-3 flex-shrink-0" />
                Recomendado: PNG ou SVG com fundo transparente. Tamanho ideal: 200x60px.
              </p>
              {/* Pré-visualização da Logo */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-center min-h-[80px]">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Preview da Logo"
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <Image className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                    <p className="text-gray-600 text-xs">Pré-visualização da Logo</p>
                    <p className="text-gray-700 text-xs mt-1">
                      Padrão: <span className="text-primary">/logo-default.png</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Favicon */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-400">URL do Favicon</label>
              <input
                type="url"
                value={settings.faviconUrl}
                onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all text-sm"
                placeholder="https://exemplo.com/favicon.ico"
              />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Info className="w-3 h-3 flex-shrink-0" />
                Recomendado: ICO ou PNG 32x32px. Aparece na aba do navegador.
              </p>
              {/* Pré-visualização do Favicon */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center justify-center min-h-[80px] gap-3">
                {settings.faviconUrl ? (
                  <>
                    <img
                      src={settings.faviconUrl}
                      alt="Preview do Favicon"
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <a
                      href={settings.faviconUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Ver arquivo <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-8 h-8 rounded bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-1">
                      <span className="text-primary text-xs font-bold">DB</span>
                    </div>
                    <p className="text-gray-600 text-xs">Pré-visualização do Favicon</p>
                    <p className="text-gray-700 text-xs mt-1">
                      Padrão: <span className="text-primary">ícone DB gerado</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ====== SEO & IDENTIDADE ====== */}
        <section className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Identidade & SEO</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">Título do Site</label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all"
                placeholder="Ex: Detetive Buscas - Investigação de Dados"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">Descrição (Meta Description)</label>
              <textarea
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all resize-none"
                placeholder="Uma breve descrição para os motores de busca..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">Palavras-chave (Keywords)</label>
              <input
                type="text"
                value={settings.siteKeywords}
                onChange={(e) => setSettings({ ...settings, siteKeywords: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all"
                placeholder="consultas, cpf, cnpj, veículos (separadas por vírgula)"
              />
            </div>
          </div>
        </section>

        {/* ====== INFORMAÇÕES LEGAIS (PARA TERMOS DE USO) ====== */}
        <section className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Informações Legais</h2>
              <p className="text-gray-500 text-sm">Dados que aparecerão automaticamente na página de Termos de Uso.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">Razão Social / Nome da Empresa</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all text-sm"
                placeholder="Ex: Minha Empresa de Dados LTDA"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">CNPJ</label>
              <input
                type="text"
                value={settings.companyCnpj}
                onChange={(e) => setSettings({ ...settings, companyCnpj: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all text-sm"
                placeholder="00.000.000/0001-00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">E-mail de Contato Legal</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all text-sm"
                placeholder="contato@seusite.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">WhatsApp de Suporte</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">+</span>
                <input
                  type="text"
                  value={settings.supportWhatsapp}
                  onChange={(e) => setSettings({ ...settings, supportWhatsapp: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:border-primary/50 outline-none transition-all text-sm"
                  placeholder="5511999999999"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-400">Endereço Completo</label>
              <input
                type="text"
                value={settings.companyAddress}
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all text-sm"
                placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
              />
            </div>
          </div>
        </section>

        {/* Botão de salvar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}

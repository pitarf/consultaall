'use client';

import React, { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSettings } from '@/app/actions/admin';
import { Save, Globe, MessageSquare, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteTitle: '',
    siteDescription: '',
    siteKeywords: '',
    supportWhatsapp: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSystemSettings();
        setSettings({
          siteTitle: data.siteTitle || '',
          siteDescription: data.siteDescription || '',
          siteKeywords: data.siteKeywords || '',
          supportWhatsapp: data.supportWhatsapp || ''
        });
      } catch (err) {
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
    } catch (err) {
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
        <p className="text-gray-400 mt-2">Gerencie as informações gerais e o contato de suporte.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SEO & Branding */}
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
                onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all"
                placeholder="Ex: ConsultaALL - Dados Premium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">Descrição do Site (Meta Description)</label>
              <textarea 
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all resize-none"
                placeholder="Uma breve descrição para os motores de busca..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">Palavras-chave (Keywords)</label>
              <input 
                type="text"
                value={settings.siteKeywords}
                onChange={(e) => setSettings({...settings, siteKeywords: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none transition-all"
                placeholder="consultas, cpf, cnpj, dados (separadas por vírgula)"
              />
            </div>
          </div>
        </section>

        {/* Suporte */}
        <section className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Canais de Suporte</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400">Número do WhatsApp (Com DDD e sem símbolos)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">+</span>
                <input 
                  type="text"
                  value={settings.supportWhatsapp}
                  onChange={(e) => setSettings({...settings, supportWhatsapp: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:border-primary/50 outline-none transition-all"
                  placeholder="5511999999999"
                />
              </div>
              <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                <Info className="w-3 h-3" />
                Este número será usado para gerar os links de suporte em todo o site.
              </p>
            </div>
          </div>
        </section>

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

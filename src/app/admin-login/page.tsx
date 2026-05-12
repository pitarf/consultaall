'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAdminPassword } from '@/app/actions/admin';
import { ShieldCheck, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Página de Checkpoint do Admin.
 * Solicita a senha secundária definida no ENV para liberar o acesso ao painel.
 */
export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      const res = await verifyAdminPassword(password);
      if (res.success) {
        toast.success('Acesso liberado!');
        router.push('/admin');
        router.refresh(); // Garante que o layout reavalie o cookie
      } else {
        toast.error(res.error || 'Erro ao verificar senha.');
      }
    } catch (err) {
      toast.error('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[130px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6 shadow-2xl shadow-red-500/5">
            <ShieldCheck className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Área Restrita</h1>
          <p className="text-gray-400">Insira a senha de mestre para acessar o painel administrativo.</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Senha Administrativa</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-white/10 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-red-900/20 hover:from-red-500 hover:to-red-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verificar Identidade
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-600 text-xs">
          ConsultaALL © 2026 • Segurança Nível Militar
        </p>
      </div>
    </div>
  );
}

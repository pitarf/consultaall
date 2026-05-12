'use client';

import { useActionState, useEffect } from 'react';
import { register } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Database, Lock, Mail, User } from 'lucide-react';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success('Conta criada! Você ganhou 5 créditos grátis.');
      router.push('/dashboard');
    }
  }, [state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10"></div>
      
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Database className="text-primary w-8 h-8" />
            <span className="text-2xl font-bold text-white">Consulta<span className="text-primary">ALL</span></span>
          </Link>
          <h2 className="text-2xl font-semibold text-white">Crie sua conta</h2>
          <p className="text-gray-400 text-sm mt-2">Comece a consultar dados agora mesmo.</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                name="name"
                required
                className="w-full bg-black/30 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Seu nome"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                name="email"
                required
                className="w-full bg-black/30 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                name="password"
                required
                className="w-full bg-black/30 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full btn-premium py-3 rounded-lg font-medium mt-6 flex items-center justify-center"
          >
            {isPending ? 'Criando...' : 'Cadastrar e Ganhar Créditos'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary hover:text-blue-400 font-medium transition-colors">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}

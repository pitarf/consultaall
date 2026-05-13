'use client';

import { useActionState, useEffect } from 'react';
import { requestPasswordReset } from '@/app/actions/auth';
import Link from 'next/link';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordReset, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success('Se o e-mail existir, um link de recuperação foi enviado!');
    }
  }, [state]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10"></div>
      
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-white">Esqueceu a senha?</h2>
          <p className="text-gray-400 text-sm mt-2">
            Digite o e-mail associado à sua conta. Enviaremos um link para você redefinir sua senha.
          </p>
        </div>

        {state?.success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-6 text-center">
            <p className="text-emerald-400 font-medium mb-4">
              E-mail enviado com sucesso! Verifique sua caixa de entrada e também a pasta de spam.
            </p>
            <Link href="/login" className="btn-premium inline-block py-2 px-6 rounded-lg font-medium">
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">E-mail cadastrado</label>
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

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full btn-premium py-3 rounded-lg font-medium mt-4 flex items-center justify-center"
            >
              {isPending ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}

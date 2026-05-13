'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter no mínimo 2 caracteres.' }),
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});

export async function login(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData);
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      return { error: 'Este e-mail não está cadastrado em nossa base ou credenciais inválidas.' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return { error: 'Senha incorreta. Tente novamente.' };
    }

    await createSession(user.id);
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Servidor instável. Tente novamente em alguns instantes.' };
  }
}

export async function register(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData);
  const result = registerSchema.safeParse(data);

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { name, email, password } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return { error: 'Este e-mail já está em uso.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        balance: 0.0, // Saldo inicial zerado
      },
    });

    await createSession(user.id);
    return { success: true };
  } catch (error) {
    console.error('Register error:', error);
    return { error: 'Servidor instável. Tente novamente em alguns instantes.' };
  }
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

export async function loginWithGoogle() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId) {
    console.error('Google OAuth não configurado no .env');
    redirect('/login?error=O_Login_com_Google_nao_esta_configurado');
  }

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid email profile&prompt=select_account`;
  
  redirect(url);
}

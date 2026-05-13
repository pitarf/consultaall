import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${appUrl}/login?error=Google_Auth_Falhou`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=Nenhum_Codigo_Encontrado`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    console.error('Google OAuth credentials missing.');
    return NextResponse.redirect(`${appUrl}/login?error=Erro_Configuracao`);
  }

  try {
    // 1. Trocar o código de autorização por tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error('Google Token Error:', err);
      return NextResponse.redirect(`${appUrl}/login?error=Falha_Na_Autenticacao`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // 2. Obter informações do usuário
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Google UserInfo Error');
      return NextResponse.redirect(`${appUrl}/login?error=Falha_Nos_Dados`);
    }

    const googleUser = await userResponse.json();
    const { email, name } = googleUser;

    if (!email) {
      return NextResponse.redirect(`${appUrl}/login?error=Email_Obrigatorio`);
    }

    // 3. Verificar se usuário existe ou criar um novo
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Usuário Google',
          passwordHash: null, // Sem senha
          balance: 0.0,
        },
      });
    }

    // 4. Criar sessão e redirecionar
    await createSession(user.id);

    return NextResponse.redirect(`${appUrl}/dashboard`);

  } catch (error) {
    console.error('Google OAuth Exception:', error);
    return NextResponse.redirect(`${appUrl}/login?error=Falha_Geral`);
  }
}

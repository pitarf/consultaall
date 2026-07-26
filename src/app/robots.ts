import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let baseUrl = 'https://detetivebuscas.com.br';

  try {
    const settings = await prisma.systemSetting.findFirst();
    if (settings && process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    }
  } catch (err) {
    console.error('Erro ao ler robots settings:', err);
  }

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/home2',
        '/login',
        '/cadastro',
        '/esqueceu-senha',
        '/protecao-de-dados',
        '/termos',
      ],
      disallow: [
        '/admin',
        '/admin-login',
        '/dashboard/',
        '/api/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

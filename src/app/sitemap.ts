import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = 'https://detetivebuscas.com.br';
  
  try {
    const settings = await prisma.systemSetting.findFirst();
    if (settings && process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    }
  } catch (err) {
    console.error('Erro ao ler sitemap settings:', err);
  }

  const routes = [
    '',
    '/home2',
    '/login',
    '/cadastro',
    '/esqueceu-senha',
    '/protecao-de-dados',
    '/termos',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}

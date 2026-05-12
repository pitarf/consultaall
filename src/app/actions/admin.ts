'use server';

import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Middleware de verificação de permissão
async function checkAdmin() {
  const session = await verifySession();
  if (!session) throw new Error('Não autenticado');

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== 'ADMIN') throw new Error('Sem permissão');

  return user;
}

export async function getDashboardMetrics() {
  await checkAdmin();

  // Receita Total (Soma de transações do tipo PURCHASE)
  const revenueResult = await prisma.transaction.aggregate({
    where: { type: 'PURCHASE' },
    _sum: { amount: true },
  });
  const totalRevenue = revenueResult._sum.amount || 0;

  // Consultas Realizadas
  const totalQueries = await prisma.searchHistory.count();

  // Usuários Ativos
  const totalUsers = await prisma.user.count({ where: { active: true } });

  // Vendas Recentes
  const recentSales = await prisma.transaction.findMany({
    where: { type: 'PURCHASE' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: { select: { name: true, email: true } } }
  });

  // Top Consultas (agrupadas pelo target)
  const topQueries = await prisma.searchHistory.groupBy({
    by: ['target'],
    _count: { target: true },
    orderBy: { _count: { target: 'desc' } },
    take: 5,
  });

  return { totalRevenue, totalQueries, totalUsers, recentSales, topQueries };
}

export async function getUsers() {
  await checkAdmin();
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, balance: true, role: true, active: true, createdAt: true }
  });
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  await checkAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { active: !currentStatus },
  });
  revalidatePath('/admin/usuarios');
  return { success: true };
}

export async function addBalance(userId: string, amount: number, description: string) {
  await checkAdmin();
  
  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        userId,
        amount: amount,
        type: 'ADJUSTMENT', 
        description: `Admin Ajuste: ${description}`,
      }
    });

    await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } }
    });
  });

  revalidatePath('/admin/usuarios');
  return { success: true };
}

export async function getSystemSettings() {
  await checkAdmin();
  let settings = await prisma.systemSetting.findFirst();
  
  if (!settings) {
    // Cria o registro padrão se não existir
    settings = await prisma.systemSetting.create({
      data: { id: 'default' }
    });
  }
  
  return settings;
}

export async function updateSystemSettings(data: {
  siteTitle?: string;
  siteDescription?: string;
  siteKeywords?: string;
  supportWhatsapp?: string;
}) {
  await checkAdmin();
  
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data }
  });

  revalidatePath('/admin/configuracoes');
  revalidatePath('/dashboard'); // Para atualizar o link de suporte se necessário
  return { success: true };
}

export async function getUserAuditData(userId: string) {
  await checkAdmin();
  
  const [history, transactions] = await Promise.all([
    prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  ]);

  return { history, transactions };
}

export async function getAdvancedMetrics(monthFilter?: number) {
  await checkAdmin();
  const now = new Date();
  const month = monthFilter !== undefined ? monthFilter : now.getMonth();
  const year = now.getFullYear();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  // Faturamento do Mês Selecionado (DEPOSIT confirmados)
  const monthlyRevenue = await prisma.transaction.aggregate({
    where: { 
      type: 'DEPOSIT', 
      status: 'COMPLETED',
      createdAt: { gte: startOfMonth, lte: endOfMonth }
    },
    _sum: { amount: true }
  });

  // Consultas do Mês
  const monthlyQueries = await prisma.searchHistory.count({
    where: { createdAt: { gte: startOfMonth, lte: endOfMonth } }
  });

  // Faturamento por Dia (Últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyData = await prisma.transaction.findMany({
    where: { 
      type: 'DEPOSIT', 
      status: 'COMPLETED',
      createdAt: { gte: thirtyDaysAgo }
    },
    select: { amount: true, createdAt: true }
  });

  // Agrupar por dia (isso é feito melhor no JS após a busca)
  const statsByDay = dailyData.reduce((acc: any, t) => {
    const day = t.createdAt.toLocaleDateString('pt-BR');
    acc[day] = (acc[day] || 0) + t.amount;
    return acc;
  }, {});

  return {
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    monthlyQueries,
    statsByDay
  };
}

export async function getSystemLogs() {
  await checkAdmin();
  return prisma.systemLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  });
}

export async function getSalesHistory() {
  await checkAdmin();
  return prisma.transaction.findMany({
    where: { type: 'DEPOSIT', status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } } }
  });
}

'use server';

import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

/**
 * Verifica a senha secundária do painel administrativo.
 * Define um cookie de acesso se a senha estiver correta.
 */
export async function verifyAdminPassword(password: string) {
  const session = await verifySession();
  if (!session) return { error: 'Sessão expirada.' };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== 'ADMIN') return { error: 'Acesso negado.' };

  // Verifica se está em período de bloqueio
  if (user.adminLockoutUntil && user.adminLockoutUntil > new Date()) {
    const espera = Math.ceil((user.adminLockoutUntil.getTime() - Date.now()) / 1000 / 60);
    return { error: `Muitas tentativas. Tente novamente em ${espera} minutos.` };
  }

  const correctPassword = process.env.ADMIN_PANEL_PASSWORD || '@212121@';

  if (password === correctPassword) {
    // Sucesso: Reseta tentativas e define cookie
    await prisma.user.update({
      where: { id: user.id },
      data: { adminAttempts: 0, adminLockoutUntil: null }
    });

    const cookieStore = await cookies();
    cookieStore.set('admin_verified', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 4, // 4 horas de acesso
      sameSite: 'lax',
      path: '/admin',
    });
    return { success: true };
  }

  // Falha: Incrementa tentativas
  const novasTentativas = user.adminAttempts + 1;
  const maxTentativas = 3;
  
  const updateData: any = { adminAttempts: novasTentativas };
  
  if (novasTentativas >= maxTentativas) {
    // Bloqueia por 1 hora
    const lockout = new Date(Date.now() + 60 * 60 * 1000);
    updateData.adminLockoutUntil = lockout;
    updateData.adminAttempts = 0; // Opcional: resetar após configurar o bloqueio
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData
  });

  const restantes = maxTentativas - novasTentativas;
  return { 
    error: novasTentativas >= maxTentativas 
      ? 'Acesso bloqueado por 1 hora devido a múltiplas tentativas incorretas.' 
      : `Senha incorreta. Você tem mais ${restantes} tentativas.` 
  };
}

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

  // Receita Total (Soma de transações do tipo DEPOSIT confirmados)
  const revenueResult = await prisma.transaction.aggregate({
    where: { 
      type: 'DEPOSIT',
      status: 'COMPLETED'
    },
    _sum: { amount: true },
  });
  const totalRevenue = revenueResult._sum.amount || 0;

  // Consultas Realizadas
  const totalQueries = await prisma.searchHistory.count();

  // Usuários Ativos
  const totalUsers = await prisma.user.count({ where: { active: true } });

  // Vendas Recentes (DEPOSIT confirmados)
  const recentSales = await prisma.transaction.findMany({
    where: { 
      type: 'DEPOSIT',
      status: 'COMPLETED'
    },
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
    select: { id: true, name: true, email: true, balance: true, role: true, active: true, createdAt: true, lastAccessAt: true }
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

export async function toggleUserRole(userId: string, currentRole: string) {
  await checkAdmin();
  const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });
  revalidatePath('/admin/usuarios');
  return { success: true, newRole };
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
  logoUrl?: string;
  faviconUrl?: string;
  companyName?: string;
  companyCnpj?: string;
  companyAddress?: string;
  companyEmail?: string;
  pushinpayToken?: string;
  pushinpayWebhookToken?: string;
}) {
  await checkAdmin();
  
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: data,
    create: { id: 'default', ...data }
  });

  revalidatePath('/admin/configuracoes');
  revalidatePath('/');
  revalidatePath('/dashboard');
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
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  });

  // Buscar Novos Usuários (Últimos 30 dias)
  const dailyUsers = await prisma.user.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' }
  });

  // Agrupar por dia garantindo que todos os últimos 30 dias estejam presentes em ordem cronológica
  const chartData: { day: string; amount: number; users: number }[] = [];
  const statsMap: { [key: string]: { amount: number; users: number } } = {};
  
  // Helper para formatar data localmente no formato YYYY-MM-DD e DD/MM
  const formatDate = (date: Date) => {
    // Usar fuso do Brasil para agrupar corretamente os dias
    return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    statsMap[dateStr] = { amount: 0, users: 0 };
    chartData.push({ day: dateStr, amount: 0, users: 0 });
  }

  dailyData.forEach((t) => {
    const dateStr = formatDate(t.createdAt);
    if (statsMap[dateStr]) {
      statsMap[dateStr].amount += t.amount;
      const target = chartData.find(item => item.day === dateStr);
      if (target) target.amount += t.amount;
    }
  });

  dailyUsers.forEach((u) => {
    const dateStr = formatDate(u.createdAt);
    if (statsMap[dateStr]) {
      statsMap[dateStr].users += 1;
      const target = chartData.find(item => item.day === dateStr);
      if (target) target.users += 1;
    }
  });

  return {
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    monthlyQueries,
    chartData
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

/**
 * Retorna todos os depósitos Pix que ainda estão aguardando aprovação (PENDING).
 */
export async function getPendingDeposits() {
  await checkAdmin();
  return prisma.transaction.findMany({
    where: { type: 'DEPOSIT', status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } } }
  });
}

/**
 * Confirma manualmente uma recarga Pix pendente, incrementando o saldo do usuário
 * e registrando o log de auditoria correspondente.
 */
export async function approveDepositManual(transactionId: string) {
  const admin = await checkAdmin();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Busca a transação pendente
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true }
      });

      if (!transaction) {
        throw new Error('Transação não encontrada.');
      }

      if (transaction.status === 'COMPLETED') {
        throw new Error('Transação já está confirmada.');
      }

      if (transaction.type !== 'DEPOSIT') {
        throw new Error('Esta transação não é um depósito.');
      }

      // 2. Atualiza a transação para COMPLETED e documenta a ação
      await tx.transaction.update({
        where: { id: transactionId },
        data: { 
          status: 'COMPLETED',
          description: `${transaction.description || 'Recarga de Saldo - Pix'} (Aprovado Manualmente por Admin)`
        }
      });

      // 3. Incrementa o saldo do usuário com o valor exato da transação
      await tx.user.update({
        where: { id: transaction.userId },
        data: { 
          balance: { increment: transaction.amount }
        }
      });

      // 4. Registra no Log do Sistema a aprovação manual para auditoria
      await tx.systemLog.create({
        data: {
          level: 'INFO',
          message: `Depósito Pix de R$ ${transaction.amount.toFixed(2)} confirmado MANUALMENTE pelo Admin para o usuário: ${transaction.user.email}`,
          context: { 
            userId: transaction.userId, 
            transactionId: transaction.id,
            adminId: admin.id,
            amount: transaction.amount
          }
        }
      });

      return { success: true };
    });

    revalidatePath('/admin/vendas');
    return result;
  } catch (error: any) {
    console.error('❌ Erro ao aprovar Pix manualmente:', error.message || error);
    return { error: error.message || 'Erro interno ao processar aprovação.' };
  }
}

/**
 * Cria e aprova manualmente uma recarga Pix (para casos em que o webhook falhou e a transação
 * nem sequer foi registrada no banco de dados de produção).
 */
export async function createAndApproveDepositManual(userId: string, externalId: string | null | undefined, amount: number) {
  const admin = await checkAdmin();

  // Se o externalId não for fornecido, geramos um ID de controle manual único automático
  const finalExternalId = externalId?.trim() || `MANUAL-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

  if (!userId || !amount || isNaN(amount) || amount <= 0) {
    return { error: 'Dados inválidos para criação do Pix manual.' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verifica se já existe transação com esse externalId no banco para evitar duplicidade
      const existingTx = await tx.transaction.findUnique({
        where: { externalId: finalExternalId }
      });

      if (existingTx) {
        throw new Error(`O ID do Pix ${finalExternalId} já está registrado no sistema (Status: ${existingTx.status}).`);
      }

      // 2. Busca o usuário
      const user = await tx.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Usuário não encontrado.');
      }

      // 3. Cria a transação COMPLETED do tipo DEPOSIT com o externalId final
      const transaction = await tx.transaction.create({
        data: {
          userId,
          amount,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          externalId: finalExternalId,
          description: `Recarga de Saldo - Pix (Criado e Aprovado Manualmente)`
        }
      });

      // 4. Incrementa o saldo do usuário
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: amount }
        }
      });

      // 5. Registra o log no sistema
      await tx.systemLog.create({
        data: {
          level: 'INFO',
          message: `Depósito Pix de R$ ${amount.toFixed(2)} criado e aprovado MANUALMENTE pelo Admin para o usuário: ${user.email} (ID Pix: ${finalExternalId})`,
          context: {
            userId,
            transactionId: transaction.id,
            adminId: admin.id,
            amount,
            externalId: finalExternalId
          }
        }
      });

      return { success: true };
    });

    revalidatePath('/admin/usuarios');
    revalidatePath('/admin/vendas');
    return result;
  } catch (error: any) {
    console.error('❌ Erro ao criar e aprovar Pix manualmente:', error.message || error);
    return { error: error.message || 'Erro interno ao processar criação.' };
  }
}

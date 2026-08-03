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

// Helpers de Custo de API
function calculateApiCostForSearch(target: string, cost: number): number {
  const cleanTarget = target.toLowerCase();
  if (cleanTarget.includes('cpf')) return 0.25;
  if (cleanTarget.includes('cnpj')) return 0.35;
  if (cleanTarget.includes('placa') || cleanTarget.includes('veiculo') || cleanTarget.includes('veicular')) return 0.30;
  if (cleanTarget.includes('telefone') || cleanTarget.includes('email') || cleanTarget.includes('nome') || cleanTarget.includes('smart')) return 0.15;
  return Number(cost || 0) * 0.4;
}

function calculateTotalApiCost(searchesByTarget: { target: string; _count: { id: number }; _sum: { cost: number | null } }[]) {
  let total = 0;
  searchesByTarget.forEach(g => {
    const target = g.target;
    const count = g._count.id;
    const sumCost = g._sum.cost || 0;
    const cleanTarget = target.toLowerCase();
    
    let unitCost = 0;
    if (cleanTarget.includes('cpf')) unitCost = 0.25;
    else if (cleanTarget.includes('cnpj')) unitCost = 0.35;
    else if (cleanTarget.includes('placa') || cleanTarget.includes('veiculo') || cleanTarget.includes('veicular')) unitCost = 0.30;
    else if (cleanTarget.includes('telefone') || cleanTarget.includes('email') || cleanTarget.includes('nome') || cleanTarget.includes('smart')) unitCost = 0.15;
    
    if (unitCost > 0) {
      total += count * unitCost;
    } else {
      total += sumCost * 0.4;
    }
  });
  return total;
}

export async function getDashboardMetrics() {
  await checkAdmin();

  // Corrige retroativamente usuários criados antes desta implementação
  // para que não vejam o popup promocional (apenas novos cadastros verão)
  try {
    await prisma.user.updateMany({
      where: {
        createdAt: { lt: new Date('2026-07-25T00:00:00Z') },
        hasSeenPromoPopup: false
      },
      data: {
        hasSeenPromoPopup: true
      }
    });
  } catch (err) {
    console.error('Erro ao corrigir hasSeenPromoPopup de usuários antigos:', err);
  }

  // Receita Total Histórica (Soma de transações do tipo DEPOSIT confirmadas)
  const revenueResult = await prisma.transaction.aggregate({
    where: { 
      type: 'DEPOSIT',
      status: 'COMPLETED'
    },
    _sum: { amount: true },
    _count: { id: true },
  });
  const totalRevenue = revenueResult._sum.amount || 0;
  const totalDepositsCount = revenueResult._count.id || 0;

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

  // Pegar a taxa Pix das configurações
  const settings = await prisma.systemSetting.findFirst();
  const pixFee = settings?.pixFee ?? 0.95;

  // Faturamento e Custos de Hoje e Ontem (usando Brasília/São Paulo UTC-3)
  const BR_OFFSET_MS = -3 * 60 * 60 * 1000;
  const now = new Date();
  const nowBr = new Date(Date.now() + BR_OFFSET_MS);

  // Início do dia de hoje em Brasília (00:00:00.000)
  const startOfTodayBr = new Date(nowBr);
  startOfTodayBr.setUTCHours(0, 0, 0, 0);
  const startOfTodayUTC = new Date(startOfTodayBr.getTime() - BR_OFFSET_MS);

  // Início do dia de ontem em Brasília
  const startOfYesterdayUTC = new Date(startOfTodayUTC.getTime() - 24 * 60 * 60 * 1000);

  // Depósitos de Hoje
  const todayDeposits = await prisma.transaction.findMany({
    where: {
      type: 'DEPOSIT',
      status: 'COMPLETED',
      createdAt: { gte: startOfTodayUTC }
    },
    select: { amount: true }
  });
  const todayRevenue = todayDeposits.reduce((sum, tx) => sum + tx.amount, 0);

  // Consultas de Hoje
  const todaySearchesByTarget = await prisma.searchHistory.groupBy({
    by: ['target'],
    where: {
      status: 'SUCCESS',
      createdAt: { gte: startOfTodayUTC }
    },
    _count: { id: true },
    _sum: { cost: true }
  });
  const todayApiCost = calculateTotalApiCost(todaySearchesByTarget);
  const todayPixFees = todayDeposits.length * pixFee;
  const todayCost = todayPixFees + todayApiCost;
  const todayProfit = todayRevenue - todayCost;

  // Depósitos de Ontem
  const yesterdayDeposits = await prisma.transaction.findMany({
    where: {
      type: 'DEPOSIT',
      status: 'COMPLETED',
      createdAt: {
        gte: startOfYesterdayUTC,
        lt: startOfTodayUTC
      }
    },
    select: { amount: true }
  });
  const yesterdayRevenue = yesterdayDeposits.reduce((sum, tx) => sum + tx.amount, 0);

  // Consultas de Ontem
  const yesterdaySearchesByTarget = await prisma.searchHistory.groupBy({
    by: ['target'],
    where: {
      status: 'SUCCESS',
      createdAt: {
        gte: startOfYesterdayUTC,
        lt: startOfTodayUTC
      }
    },
    _count: { id: true },
    _sum: { cost: true }
  });
  const yesterdayApiCost = calculateTotalApiCost(yesterdaySearchesByTarget);
  const yesterdayPixFees = yesterdayDeposits.length * pixFee;
  const yesterdayCost = yesterdayPixFees + yesterdayApiCost;
  const yesterdayProfit = yesterdayRevenue - yesterdayCost;

  let changePercentage = 0;
  if (yesterdayRevenue > 0) {
    changePercentage = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
  } else if (todayRevenue > 0) {
    changePercentage = 100;
  }

  // Custos acumulados históricos (Pix Fees + API Costs de todas as consultas com status SUCCESS)
  const totalPixFees = totalDepositsCount * pixFee;
  
  const searchesByTarget = await prisma.searchHistory.groupBy({
    by: ['target'],
    where: { status: 'SUCCESS' },
    _count: { id: true },
    _sum: { cost: true }
  });
  const totalApiCost = calculateTotalApiCost(searchesByTarget);
  
  const totalCost = totalPixFees + totalApiCost;
  const totalProfit = totalRevenue - totalCost;

  return { 
    totalRevenue, 
    totalQueries, 
    totalUsers, 
    recentSales, 
    topQueries,
    todayRevenue,
    todayCost,
    todayProfit,
    yesterdayRevenue,
    yesterdayCost,
    yesterdayProfit,
    changePercentage,
    totalCost,
    totalProfit,
    pixFee
  };
}

export async function getUsers() {
  await checkAdmin();
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, balance: true, role: true, active: true, createdAt: true, lastActiveAt: true, whatsapp: true }
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
  pixFee?: number;
  brevoApiKey?: string;
  directDataToken?: string;
  directDataBaseUrl?: string;
  directDataV3Url?: string;
  apiConsultaToken?: string;
  apiConsultaUrl?: string;
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

export async function getAdvancedMetrics(period: string = 'month') {
  await checkAdmin();

  const settings = await prisma.systemSetting.findFirst();
  const pixFee = settings?.pixFee ?? 0.95;

  const BR_OFFSET_MS = -3 * 60 * 60 * 1000;
  const now = new Date();
  const nowBr = new Date(Date.now() + BR_OFFSET_MS);

  let startDate: Date | undefined;
  let endDate: Date = now;

  if (period === 'today') {
    const startOfTodayBr = new Date(nowBr);
    startOfTodayBr.setUTCHours(0, 0, 0, 0);
    startDate = new Date(startOfTodayBr.getTime() - BR_OFFSET_MS);

    const endOfTodayBr = new Date(nowBr);
    endOfTodayBr.setUTCHours(23, 59, 59, 999);
    endDate = new Date(endOfTodayBr.getTime() - BR_OFFSET_MS);
  } else if (period === 'week') {
    const startOfBr = new Date(nowBr);
    startOfBr.setUTCDate(nowBr.getUTCDate() - 6);
    startOfBr.setUTCHours(0, 0, 0, 0);
    startDate = new Date(startOfBr.getTime() - BR_OFFSET_MS);
  } else if (period === 'month') {
    const startOfBr = new Date(nowBr);
    startOfBr.setUTCDate(nowBr.getUTCDate() - 29);
    startOfBr.setUTCHours(0, 0, 0, 0);
    startDate = new Date(startOfBr.getTime() - BR_OFFSET_MS);
  } else if (period === 'year') {
    const startOfBr = new Date(nowBr.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
    startDate = new Date(startOfBr.getTime() - BR_OFFSET_MS);
  } else {
    startDate = undefined;
  }

  // 1. Faturamento do Período (DEPOSIT confirmados)
  const monthlyRevenueResult = await prisma.transaction.aggregate({
    where: { 
      type: 'DEPOSIT', 
      status: 'COMPLETED',
      createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate }
    },
    _sum: { amount: true },
    _count: { id: true }
  });
  const monthlyRevenue = monthlyRevenueResult._sum.amount || 0;
  const monthlyDepositsCount = monthlyRevenueResult._count.id || 0;

  // 2. Consultas do Período
  const monthlyQueries = await prisma.searchHistory.count({
    where: { 
      createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate }
    }
  });

  // 3. Custos do Período
  const searchesByTarget = await prisma.searchHistory.groupBy({
    by: ['target'],
    where: { 
      status: 'SUCCESS',
      createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate }
    },
    _count: { id: true },
    _sum: { cost: true }
  });
  const monthlyApiCosts = calculateTotalApiCost(searchesByTarget);
  const monthlyPixFees = monthlyDepositsCount * pixFee;
  const monthlyCosts = monthlyPixFees + monthlyApiCosts;
  const monthlyProfit = monthlyRevenue - monthlyCosts;

  // 4. Dados para o Gráfico com Pre-fill
  const dailyTransactions = await prisma.transaction.findMany({
    where: { 
      type: 'DEPOSIT', 
      status: 'COMPLETED',
      createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate }
    },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  });

  const dailyUsers = await prisma.user.findMany({
    where: { 
      createdAt: startDate ? { gte: startDate, lte: endDate } : { lte: endDate }
    },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' }
  });

  const chartMap = new Map<string, { faturamento: number; cadastros: number }>();

  // Auxiliar para preencher chaves
  const getLocalDateKey = (date: Date) => {
    const parts = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    }).formatToParts(date);
    
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';

    const hour = getPart('hour').padStart(2, '0');
    const day = getPart('day').padStart(2, '0');
    const month = getPart('month').padStart(2, '0');
    const yearShort = getPart('year').slice(-2);

    if (period === 'today') {
      return `${hour}:00`;
    } else if (period === 'week' || period === 'month') {
      return `${day}/${month}`;
    } else if (period === 'year') {
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const monthIndex = parseInt(month, 10) - 1;
      return months[monthIndex] || 'Jan';
    } else {
      return `${month}/${yearShort}`;
    }
  };

  // Inicializar o mapa (Pre-fill com Zero)
  if (period === 'today') {
    for (let i = 0; i < 24; i++) {
      chartMap.set(`${String(i).padStart(2, '0')}:00`, { faturamento: 0, cadastros: 0 });
    }
  } else if (period === 'week') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(nowBr.getTime() - BR_OFFSET_MS);
      d.setDate(d.getDate() - i);
      chartMap.set(getLocalDateKey(d), { faturamento: 0, cadastros: 0 });
    }
  } else if (period === 'month') {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(nowBr.getTime() - BR_OFFSET_MS);
      d.setDate(d.getDate() - i);
      chartMap.set(getLocalDateKey(d), { faturamento: 0, cadastros: 0 });
    }
  } else if (period === 'year') {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    for (let i = 0; i < 12; i++) {
      chartMap.set(months[i], { faturamento: 0, cadastros: 0 });
    }
  } else {
    // 'all' -> de Janeiro de 2026 até hoje
    const startTemp = new Date(2026, 0, 1);
    while (startTemp <= now) {
      chartMap.set(getLocalDateKey(startTemp), { faturamento: 0, cadastros: 0 });
      startTemp.setMonth(startTemp.getMonth() + 1);
    }
  }

  // Preencher faturamento
  dailyTransactions.forEach(tx => {
    const key = getLocalDateKey(tx.createdAt);
    if (chartMap.has(key)) {
      const data = chartMap.get(key)!;
      data.faturamento += tx.amount;
    }
  });

  // Preencher cadastros
  dailyUsers.forEach(user => {
    const key = getLocalDateKey(user.createdAt);
    if (chartMap.has(key)) {
      const data = chartMap.get(key)!;
      data.cadastros += 1;
    }
  });

  const chartData = Array.from(chartMap.entries()).map(([label, val]) => ({
    day: label,
    amount: Number(val.faturamento.toFixed(2)),
    users: val.cadastros
  }));

  // 5. Tabela de Atribuição de Tráfego / UTMs
  const usersWithAttribution = await prisma.user.findMany({
    select: {
      id: true,
      trafficSource: true,
      transactions: {
        where: { type: 'DEPOSIT', status: 'COMPLETED' },
        select: { amount: true }
      },
      searches: {
        where: { status: 'SUCCESS' },
        select: { target: true, cost: true }
      }
    }
  });

  const trafficStats: {
    [source: string]: {
      source: string;
      usersCount: number;
      faturamento: number;
      custos: number;
      lucro: number;
      roi: number;
    }
  } = {};

  usersWithAttribution.forEach(u => {
    const source = u.trafficSource || 'orgânico';
    if (!trafficStats[source]) {
      trafficStats[source] = { source, usersCount: 0, faturamento: 0, custos: 0, lucro: 0, roi: 0 };
    }
    
    const stats = trafficStats[source];
    stats.usersCount += 1;
    
    const totalDeposits = u.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    stats.faturamento += totalDeposits;

    const totalPixFees = u.transactions.length * pixFee;
    
    const searchesGrouped: { [target: string]: { count: number; sumCost: number } } = {};
    u.searches.forEach(s => {
      if (!searchesGrouped[s.target]) {
        searchesGrouped[s.target] = { count: 0, sumCost: 0 };
      }
      searchesGrouped[s.target].count += 1;
      searchesGrouped[s.target].sumCost += s.cost;
    });

    const parsedSearches = Object.entries(searchesGrouped).map(([target, info]) => ({
      target,
      _count: { id: info.count },
      _sum: { cost: info.sumCost }
    }));

    const totalApiCost = calculateTotalApiCost(parsedSearches);
    const totalCosts = totalPixFees + totalApiCost;

    stats.custos += totalCosts;
  });

  const attributionTable = Object.values(trafficStats).map(stats => {
    const lucro = stats.faturamento - stats.custos;
    const roi = stats.custos > 0 ? (lucro / stats.custos) * 100 : 0;
    return {
      source: stats.source,
      usersCount: stats.usersCount,
      faturamento: Number(stats.faturamento.toFixed(2)),
      custos: Number(stats.custos.toFixed(2)),
      lucro: Number(lucro.toFixed(2)),
      roi: Number(roi.toFixed(0))
    };
  }).sort((a, b) => b.faturamento - a.faturamento);

  return {
    monthlyRevenue,
    monthlyCosts,
    monthlyProfit,
    monthlyQueries,
    chartData,
    attributionTable
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

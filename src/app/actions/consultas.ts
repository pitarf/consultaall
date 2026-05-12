'use server';

import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { fazerConsultaAPI } from '@/services/api-consulta';
import { validarChave } from '@/lib/validators';

export async function getPricing() {
  return prisma.modulePricing.findMany();
}

export async function realizarConsulta(target: string, query: string, selectedModules: string[] = [], isTest: boolean = false) {
  const session = await verifySession();

  if (!session) {
    return { error: 'Sessão expirada. Faça login novamente.' };
  }

  // Validação de Segurança e Sanitização (Remoção de espaços)
  const cleanQuery = query.trim();
  const validation = validarChave(target, cleanQuery);
  if (!validation.valid) {
    return { error: validation.message };
  }

  if (!selectedModules || selectedModules.length === 0) {
    return { error: 'Nenhum conjunto de dados selecionado.' };
  }

  // Busca os preços dinamicos no banco
  const prices = await prisma.modulePricing.findMany({
    where: { id: { in: selectedModules } }
  });

  if (prices.length === 0) {
    return { error: 'Módulos inválidos ou não encontrados.' };
  }

  const totalCost = prices.reduce((acc, module) => acc + module.price, 0);

  if (totalCost <= 0) {
    return { error: 'Custo de consulta inválido.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { error: 'Usuário não encontrado.' };
    }

    // Só permite isTest se o usuário for ADMIN
    const effectiveIsTest = isTest && user.role === 'ADMIN';

    // Mapeamento Técnico de Alvos da API
    let apiTarget = '';
    switch (target) {
      case 'cpf':
        apiTarget = 'cpf-detalhada-pessoa-fisica';
        break;
      case 'nome':
        apiTarget = 'busca-por-nome';
        break;
      case 'telefone':
        apiTarget = 'busca-por-telefone';
        break;
      case 'email':
        apiTarget = 'busca-por-email';
        break;
      default:
        apiTarget = target;
    }

    // SISTEMA DE CACHE (48 HORAS)
    // Verifica se já existe uma consulta idêntica e bem-sucedida nas últimas 48h
    const quarentaEOitoHorasAtras = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const cache = await prisma.searchHistory.findFirst({
      where: {
        target: apiTarget,
        query: cleanQuery,
        status: 'SUCCESS',
        createdAt: { gte: quarentaEOitoHorasAtras }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (cache && !effectiveIsTest) {
      // Se houver cache, retornamos o resultado salvo sem cobrar o usuário novamente
      // e sem gastar saldo da sua API real.
      return { 
        success: true, 
        data: cache.result, 
        newBalance: user.balance, 
        isCached: true 
      };
    }

    // Se NÃO for teste e NÃO houver cache, verifica saldo
    if (!effectiveIsTest) {
      if (user.balance < totalCost) {
        return { error: `Saldo insuficiente. Esta consulta requer R$ ${totalCost.toFixed(2).replace('.', ',')}.` };
      }
    }

    // 1. Chama a API (Passando o flag de teste e o target mapeado)
    const apiResult = await fazerConsultaAPI({ 
      target: apiTarget, 
      pacote: 'teste', // Conforme seu exemplo
      query: cleanQuery, 
      isTest: effectiveIsTest 
    });

    if (!apiResult.success) {
      // Log de erro da API
      await prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: `Falha na API de Consulta: ${apiResult.message || 'Erro desconhecido'}`,
          context: { userId: user.id, target, query: cleanQuery, apiResult }
        }
      });
      return { error: apiResult.message || 'Erro na consulta na API.' };
    }

    // Se for teste, retorna agora sem cobrar e sem salvar histórico (opcional salvar como rascunho)
    if (effectiveIsTest) {
      return { success: true, data: apiResult.data, newBalance: user.balance, isDemo: true };
    }

    // 2. Transação para descontar o saldo e registrar o histórico com SEGURANÇA (Apenas consultas Reais)
    const result = await prisma.$transaction(async (tx) => {
      // Cria a transação de uso
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: -totalCost,
          type: 'USAGE',
          description: `Consulta: ${target} / Módulos: ${selectedModules.length}`,
        },
      });

      // Atualiza saldo do usuário
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: totalCost } },
      });

      // Registra Histórico
      const history = await tx.searchHistory.create({
        data: {
          userId: user.id,
          query: cleanQuery,
          target,
          cost: totalCost,
          status: 'SUCCESS',
          result: apiResult.data, 
        },
      });

      return { updatedUser, history };
    });

    return { success: true, data: apiResult.data, newBalance: result.updatedUser.balance };
  } catch (error: any) {
    console.error('Erro ao realizar consulta:', error);
    
    // Log de erro crítico/servidor
    await prisma.systemLog.create({
      data: {
        level: 'ERROR',
        message: `Erro crítico no servidor de consultas: ${error.message}`,
        context: { userId: session.userId, target, query: cleanQuery, error: error.stack }
      }
    });

    return { error: error.message || 'Servidor instável. Tente novamente.' };
  }
}

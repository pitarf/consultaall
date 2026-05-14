'use server';

import { verifySession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { fazerConsultaAPI } from '@/services/api-consulta';
import { performSmartSearch, consultaCpfPlus, consultaVeicular, consultaCnpjPlus } from '@/services/direct-data';
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
      case 'placa':
        apiTarget = 'consulta-veicular';
        break;
      default:
        apiTarget = target;
    }

    // SISTEMA DE CACHE (48 HORAS)
    const sortedModules = [...selectedModules].sort().join(',');
    const quarentaEOitoHorasAtras = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const cache = await prisma.searchHistory.findFirst({
      where: {
        target: target,
        query: cleanQuery,
        modules: sortedModules, // Garante que o cache tenha os mesmos módulos
        status: 'SUCCESS',
        createdAt: { gte: quarentaEOitoHorasAtras }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 1. Define se vai usar API ou Cache (Economia interna)
    let apiResult: any;

    if (cache && !effectiveIsTest) {
      // Se houver cache, preparamos o resultado sem chamar a API. 
      // O cliente CONTINUA SENDO COBRADO, mas nós poupamos a API (lucro!).
      apiResult = { success: true, data: cache.result };
    } else if (effectiveIsTest) {
      // MOCK UNIFICADO PARA MODO DEMO
      await new Promise(resolve => setTimeout(resolve, 1500));
      apiResult = {
        success: true,
        data: {
          Aviso_Demo: "Estes são dados FALSOS de teste para o administrador.",
          Dados_Basicos: { 
            cnpj: "00.000.000/0001-00", 
            razao_social: "EMPRESA DE TESTE S.A",
            matriz: "Sim",
            porte: "DEMAIS",
            situacao_cadastral: "ATIVA"
          },
          Natureza_e_Atividades: {
            natureza_juridica: "2062 - Sociedade Empresária Limitada",
            cnae_principal: "6204-0/00 - Consultoria em tecnologia da informação",
            cnaes_secundarios: ["6201-5/01 - Desenvolvimento de programas de computador"]
          },
          Contato_e_Localizacao: { 
            emails: ["contato@empresateste.com.br"], 
            telefones: ["11 99999-9999 (VIVO - Whats)", "11 3333-3333 (Fixo)"],
            enderecos: [{ logradouro: "AVENIDA PAULISTA", numero: "1000", bairro: "BELA VISTA", cidade: "SAO PAULO", uf: "SP", cep: "01310-100" }]
          },
          Socios: {
            lista: [ { nome: "JOÃO DA SILVA", documento: "***.111.222-**", cargo: "Sócio-Administrador" } ]
          },
          Faturamento: {
            faixa_faturamento: "De R$ 1.2M a R$ 4.8M",
            tributacao: "Lucro Presumido"
          },
          Dados_Pessoais: { nome: "JOÃO DA SILVA TESTE", cpf: "111.222.333-44" },
          Dados_do_Veiculo: { placa: "ABC-1234", marca_modelo: "TESTE/MODELO" }
        }
      };
    } else {
      // Se NÃO houver cache e não for teste, checa saldo e chama API REAL
      if (user.balance < totalCost) {
        return { error: `Saldo insuficiente. Esta consulta requer R$ ${totalCost.toFixed(2).replace('.', ',')}.` };
      }

      if (target === 'cpf') {
        apiResult = await consultaCpfPlus(cleanQuery, selectedModules);
      } else if (target === 'cnpj') {
        apiResult = await consultaCnpjPlus(cleanQuery, selectedModules);
      } else if (target === 'placa') {
        apiResult = await consultaVeicular(cleanQuery, selectedModules);
      } else if (['email', 'telefone', 'nome'].includes(target)) {
        apiResult = await performSmartSearch(
          target as 'email' | 'phone' | 'name', 
          cleanQuery,
          selectedModules
        );
      } else {
        apiResult = await fazerConsultaAPI({ 
          target: apiTarget, 
          pacote: 'teste', 
          query: cleanQuery, 
          isTest: false // Sempre false pois já tratamos o modo de teste acima
        });
      }
    }

    if (!apiResult.success) {
      // Log de erro da API (se falhou e não era cache)
      if (!cache) {
        await prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: `Falha na API de Consulta: ${apiResult.message || 'Erro desconhecido'}`,
            context: { userId: user.id, target, query: cleanQuery, apiResult }
          }
        });
      }
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
          modules: sortedModules,
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

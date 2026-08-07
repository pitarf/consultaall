import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Rota de diagnóstico de custos de API.
 * Acesse: /api/debug-stats?date=2026-08-06
 * Retorna o agrupamento real de SearchHistory por target para o dia solicitado,
 * junto com o cálculo estimado de custo da API para cada tipo.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().slice(0, 10);

    // Calcula início e fim do dia em UTC-3 (Brasília)
    const BR_OFFSET_MS = -3 * 60 * 60 * 1000;
    const startBr = new Date(dateStr + 'T00:00:00');
    const endBr = new Date(dateStr + 'T23:59:59.999');
    const startUTC = new Date(startBr.getTime() - BR_OFFSET_MS);
    const endUTC = new Date(endBr.getTime() - BR_OFFSET_MS);

    // Agrupamento por target
    const grouped = await prisma.searchHistory.groupBy({
      by: ['target'],
      where: {
        status: 'SUCCESS',
        createdAt: { gte: startUTC, lte: endUTC }
      },
      _count: { id: true },
      _sum: { cost: true }
    });

    // Tabela de custos reais DirectData
    const getCost = (t: string) => {
      const l = t.toLowerCase();
      if (l === 'nome_candidatos') return 0;
      if (l.includes('placa') || l.includes('veiculo') || l.includes('veicular')) return 1.10;
      if (l.includes('cpf') || l.includes('cnpj')) return 0.36;
      if (l === 'nome' || l.includes('smart')) return 0.36;
      if (l.includes('telefone') || l.includes('phone') || l.includes('email')) return 0.16;
      return 0.30;
    };

    const breakdown = grouped.map(g => ({
      target: g.target,
      qtd: g._count.id,
      custoUnitarioApi: getCost(g.target),
      custoTotalApi: +(g._count.id * getCost(g.target)).toFixed(2),
      faturamentoUsuarios: +(g._sum.cost || 0).toFixed(2),
    }));

    const totalApiCost = breakdown.reduce((s, b) => s + b.custoTotalApi, 0);
    const totalUserRevenue = breakdown.reduce((s, b) => s + b.faturamentoUsuarios, 0);
    const totalQueries = breakdown.reduce((s, b) => s + b.qtd, 0);

    // Também listar todas as consultas individuais do dia para auditoria completa
    const allSearches = await prisma.searchHistory.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: startUTC, lte: endUTC }
      },
      select: {
        id: true,
        target: true,
        query: true,
        cost: true,
        createdAt: true,
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    const detalhes = allSearches.map(s => ({
      id: s.id,
      target: s.target,
      query: s.query,
      custoUsuario: s.cost,
      custoApiEstimado: getCost(s.target),
      usuario: s.user?.name || s.user?.email || 'Desconhecido',
      hora: s.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: dateStr,
      resumo: {
        totalConsultas: totalQueries,
        custoApiEstimado: +totalApiCost.toFixed(2),
        faturamentoUsuarios: +totalUserRevenue.toFixed(2),
        lucro: +(totalUserRevenue - totalApiCost).toFixed(2),
      },
      porTipo: breakdown,
      detalhes
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

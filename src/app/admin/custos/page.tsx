import { getApiCostsData, requireAdmin } from '@/app/actions/admin';
import { Coins } from 'lucide-react';
import CustosClient from './CustosClient';

export const dynamic = 'force-dynamic';

export default async function AdminCustosPage() {
  await requireAdmin();
  const data = await getApiCostsData();

  // Serializa datas para strings antes de passar ao Client Component
  const serializedBreakdown = data.dailyBreakdown;
  const serializedQueries = data.detailedQueries.map(q => ({
    ...q,
    createdAt: q.createdAt.toISOString()
  }));

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f1e36] to-[#1e3b5b] text-white p-6 md:p-8 rounded-3xl shadow-lg border border-[#1e3b5b]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Coins className="w-8 h-8 text-yellow-500" />
            Auditoria de Custos de APIs
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Rastreie o consumo real das APIs do provedor, faturamento bruto gerado pelos usuários e lucro líquido estimado.
          </p>
        </div>
      </div>

      <CustosClient 
        dailyBreakdown={serializedBreakdown} 
        detailedQueries={serializedQueries} 
      />
    </div>
  );
}

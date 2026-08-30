import { getBlockedDataList, requireAdmin } from '@/app/actions/admin';
import { ShieldAlert } from 'lucide-react';
import BloqueiosClient from './BloqueiosClient';

export const dynamic = 'force-dynamic';

export default async function AdminBloqueiosPage() {
  await requireAdmin();
  const blockedList = await getBlockedDataList();

  // Serializa as datas para strings para evitar erros de serialização do Next.js RSC
  const serializedList = blockedList.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString()
  }));

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f1e36] to-[#1e3b5b] text-white p-6 md:p-8 rounded-3xl shadow-lg border border-[#1e3b5b]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Bloqueios de Dados LGPD
          </h1>
          <p className="text-white/70 text-sm font-medium">
            Gerencie documentos e telefones bloqueados para consulta na plataforma.
          </p>
        </div>
      </div>

      <BloqueiosClient initialBlockedList={serializedList} />
    </div>
  );
}

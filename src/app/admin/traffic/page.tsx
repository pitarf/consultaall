import { getTrafficDetailedStats, requireAdmin } from '@/app/actions/admin';
import TrafficClient from './TrafficClient';

export const metadata = {
  title: 'Origem de Clientes | Admin',
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    source?: string;
  }>;
}

export default async function AdminTrafficPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q || '';
  const source = params.source || '';

  const data = await getTrafficDetailedStats(q, source);

  return (
    <TrafficClient 
      initialKpis={data.kpis}
      initialChannels={data.channelsTable}
      initialUsers={data.usersList}
      sources={data.sourcesList}
      currentQ={q}
      currentSource={source}
    />
  );
}

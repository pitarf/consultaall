'use client';

import { useRouter } from 'next/navigation';

const PERIODS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Últimos 7 dias' },
  { value: 'month', label: 'Últimos 30 dias' },
  { value: 'year', label: 'Ano Atual' },
  { value: 'all', label: 'Histórico Completo' }
];

export default function DashboardClient({ currentPeriod }: { currentPeriod: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm transition-all">
      <select 
        value={currentPeriod}
        onChange={(e) => router.push(`/admin?period=${e.target.value}`)}
        className="bg-transparent text-slate-900 dark:text-white text-sm font-bold px-4 py-2 outline-none cursor-pointer hover:text-primary transition-colors appearance-none"
      >
        {PERIODS.map((p) => (
          <option key={p.value} value={p.value} className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white">
            {p.label}
          </option>
        ))}
      </select>
      <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1"></div>
      <div className="px-4 text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest hidden sm:block">
        Filtro de Período
      </div>
    </div>
  );
}

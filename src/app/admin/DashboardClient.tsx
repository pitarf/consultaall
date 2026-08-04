'use client';

import { useRouter } from 'next/navigation';

const PERIODS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: '7 Dias' },
  { value: 'month', label: '30 Dias' },
  { value: 'year', label: 'Este Ano' },
  { value: 'all', label: 'Todo Período' }
];

export default function DashboardClient({ currentPeriod }: { currentPeriod: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center bg-black/20 dark:bg-black/35 p-1 rounded-full border border-white/10 shadow-inner gap-1 overflow-x-auto max-w-full no-scrollbar">
      {PERIODS.map((p) => {
        const active = currentPeriod === p.value;
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => router.push(`/admin?period=${p.value}`)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
              active
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

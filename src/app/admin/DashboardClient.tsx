'use client';

import { useRouter } from 'next/navigation';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function DashboardClient({ currentMonth }: { currentMonth: number }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
      <select 
        value={currentMonth}
        onChange={(e) => router.push(`/admin?month=${e.target.value}`)}
        className="bg-transparent text-white text-sm font-bold px-4 py-2 outline-none cursor-pointer hover:text-primary transition-colors appearance-none"
      >
        {MONTHS.map((name, i) => (
          <option key={i} value={i} className="bg-[#0f172a] text-white">
            {name}
          </option>
        ))}
      </select>
      <div className="w-px h-6 bg-white/10 mx-1"></div>
      <div className="px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
        Filtro de Período
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Componente do botão alternador de Tema (Dark / Light)
 * Persiste a escolha do usuário no localStorage e aplica a classe 'dark' no documento.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // Inicializa o estado com base na classe presente no documentElement no momento da montagem
  useEffect(() => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    setIsDark(isCurrentlyDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
    >
      {isDark ? (
        <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-45 text-amber-500" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12 text-slate-600" />
      )}
    </button>
  );
}

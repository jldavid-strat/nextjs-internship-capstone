'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="dark:bg-[oklab(0.403681 -0.00239785 -0.00593036 / 0.8)] text-outer_space-500 dark:text-platinum-500 hover:bg-french_gray-500 dark:hover:bg-payne's_gray-600 transition- bg-[oklab(1 0 5.96046e-8 / 0.8)] rounded-4xl p-2"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}

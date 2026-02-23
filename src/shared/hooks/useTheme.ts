import { useEffect } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('portaldoze-theme', 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
}

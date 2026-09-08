import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className={`h-4 w-4 transition-all ${theme === 'dark' ? '-rotate-90 scale-0' : 'rotate-0 scale-100'} text-gray-700`} />
      <Moon className={`absolute h-4 w-4 transition-all ${theme === 'dark' ? 'rotate-0 scale-100 text-gray-300' : 'rotate-90 scale-0 text-gray-700'}`} />
    </button>
  );
};

export default ThemeToggle;
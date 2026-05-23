import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      {theme === 'dark'
        ? <Sun className="w-4 h-4 text-white/60 hover:text-white" />
        : <Moon className="w-4 h-4 text-foreground/60 hover:text-foreground" />
      }
    </button>
  );
}
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

/**
 * ThemeToggle — renders as either an icon button (variant="icon")
 * or a labelled pill toggle (variant="pill").
 *
 * Use variant="icon"  in navbars where space is tight.
 * Use variant="pill"  in settings panels or profile pages.
 */
export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium
          transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]
          ${className}`}
        style={{
          background: 'var(--muted)',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)',
        }}
      >
        {isDark
          ? <><Sun className="w-4 h-4" /><span>Light mode</span></>
          : <><Moon className="w-4 h-4" /><span>Dark mode</span></>}
      </button>
    );
  }

  // variant === 'icon' (default)
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2 rounded-lg transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]
        hover:opacity-80 ${className}`}
      style={{
        color: 'var(--text-secondary)',
        background: 'transparent',
      }}
    >
      {isDark
        ? <Sun className="w-4 h-4" aria-hidden="true" />
        : <Moon className="w-4 h-4" aria-hidden="true" />}
    </button>
  );
}
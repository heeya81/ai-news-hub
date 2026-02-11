'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl transition-all duration-300 border ${theme === 'dark'
                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-blue-400 hover:text-white'
                : 'bg-black/5 border-black/10 hover:bg-black/10 text-blue-600 hover:text-primary'
                }`}
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
        </button>
    );
}

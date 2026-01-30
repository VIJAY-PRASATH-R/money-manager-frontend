import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-400 transition-all duration-300 bg-white dark:bg-gray-800 group"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <div className="relative w-5 h-5">
                {isDark ? (
                    <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
                ) : (
                    <Moon className="w-5 h-5 text-gray-700 group-hover:text-cyan-500 group-hover:-rotate-12 transition-all duration-300" />
                )}
            </div>
        </button>
    );
};

export default ThemeToggle;

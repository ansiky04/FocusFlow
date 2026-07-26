import React from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ThemeSettings() {
  const { themePreference, setThemePreference } = useApp();

  const handleThemeChange = (mode) => {
    setThemePreference(mode);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Theme Preferences
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Switch the app interface between Dark, Light, or automatic System themes
        </p>
      </div>

      {/* Themes layout choices */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Light Theme */}
        <button
          onClick={() => handleThemeChange('light')}
          className={`relative overflow-hidden rounded-xl border p-4 text-left flex flex-col justify-between hover:scale-[1.01] transition-all duration-200 min-h-[110px] ${
            themePreference === 'light'
              ? 'border-indigo-500 bg-indigo-500/[0.02] dark:border-indigo-500/30'
              : 'border-slate-100 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-950/20'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className={`p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400`}>
              <Sun className="h-5 w-5" />
            </div>
            {themePreference === 'light' && <Check className="h-4 w-4 text-indigo-500" />}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Light Mode
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight">
              Bright and high contrast layout
            </span>
          </div>
        </button>

        {/* Dark Theme */}
        <button
          onClick={() => handleThemeChange('dark')}
          className={`relative overflow-hidden rounded-xl border p-4 text-left flex flex-col justify-between hover:scale-[1.01] transition-all duration-200 min-h-[110px] ${
            themePreference === 'dark'
              ? 'border-indigo-500 bg-indigo-500/[0.02] dark:border-indigo-500/30'
              : 'border-slate-100 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-950/20'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className={`p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400`}>
              <Moon className="h-5 w-5" />
            </div>
            {themePreference === 'dark' && <Check className="h-4 w-4 text-indigo-500" />}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Dark Mode
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight">
              Premium modern dark theme
            </span>
          </div>
        </button>

        {/* System Theme */}
        <button
          onClick={() => handleThemeChange('system')}
          className={`relative overflow-hidden rounded-xl border p-4 text-left flex flex-col justify-between hover:scale-[1.01] transition-all duration-200 min-h-[110px] ${
            themePreference === 'system'
              ? 'border-indigo-500 bg-indigo-500/[0.02] dark:border-indigo-500/30'
              : 'border-slate-100 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-950/20'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-3">
            <div className={`p-2 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400`}>
              <Laptop className="h-5 w-5" />
            </div>
            {themePreference === 'system' && <Check className="h-4 w-4 text-indigo-500" />}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              System Theme
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight">
              Synchronize with device presets
            </span>
          </div>
        </button>
      </div>

    </div>
  );
}

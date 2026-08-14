import React from 'react';
import { 
  LineChart, 
  Moon, 
  Sun, 
  RotateCcw, 
  FileText, 
  Sliders, 
  Sparkles,
  ShieldCheck 
} from 'lucide-react';

export default function Header({ 
  hasData, 
  filename, 
  rowCount, 
  darkMode, 
  setDarkMode, 
  onReset, 
  onOpenMappingModal 
}) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-400/20">
            <LineChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-indigo-200 dark:to-indigo-400 bg-clip-text text-transparent">
                FinPulse
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Dynamic Business Financial Analyzer
            </p>
          </div>
        </div>

        {/* Center Active File Badge (when data loaded) */}
        {hasData && (
          <div className="hidden md:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 px-3 py-1.5 rounded-lg text-xs">
            <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={filename}>
              {filename}
            </span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              {rowCount} rows
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Column Mappings Button */}
          {hasData && (
            <button
              onClick={onOpenMappingModal}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
              title="Inspect or adjust column mappings"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Columns</span>
            </button>
          )}

          {/* Reset / Upload New File Button */}
          {hasData && (
            <button
              onClick={onReset}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 transition shadow-sm"
              title="Reset dashboard and upload a new CSV"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset / Upload New</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            type="button"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}

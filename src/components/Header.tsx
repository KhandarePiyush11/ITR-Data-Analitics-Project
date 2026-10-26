/**
 * FinPulse Business Financial Analyzer
 * Clean Executive Navigation & Header Bar
 * 
 * @module components/Header
 */

import React from 'react';
import { 
  BarChart3, 
  Sun, 
  Moon, 
  UploadCloud, 
  FileDown,
  Sliders
} from 'lucide-react';
import { IngestionMetadata } from '../types';

interface HeaderProps {
  metadata?: IngestionMetadata;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onReset: () => void;
  onOpenExport?: () => void;
  onOpenMappingModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metadata,
  isDarkMode,
  onToggleTheme,
  onReset,
  onOpenExport,
  onOpenMappingModal,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset} title="Return to Upload">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              FinPulse
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Business Financial Analyzer
            </p>
          </div>
        </div>

        {/* Center Active File Info */}
        {metadata && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className="max-w-[200px] truncate font-semibold">{metadata.filename}</span>
            <span className="text-slate-400">•</span>
            <span className="uppercase text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              {metadata.detectedType}
            </span>
            <span className="text-slate-400">•</span>
            <span>{metadata.totalRows.toLocaleString()} rows</span>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center space-x-2">
          {metadata && onOpenMappingModal && (
            <button
              type="button"
              onClick={onOpenMappingModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Map columns and customize financial schema"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Map Columns</span>
            </button>
          )}

          {metadata && onOpenExport && (
            <button
              type="button"
              onClick={onOpenExport}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </button>
          )}

          {metadata && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
              title="Upload another file"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New File</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};

/**
 * FinPulse Business Financial Analyzer
 * Interactive Financial Filter Bar
 * 
 * @module components/FilterBar
 */

import React from 'react';
import { 
  Filter, 
  RotateCcw, 
  Calendar, 
  Tag, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Layers
} from 'lucide-react';

interface FilterBarProps {
  categories: string[];
  dates: string[];
  selectedCategory: string;
  selectedDate: string;
  selectedFlow: 'all' | 'revenue' | 'expense';
  onCategoryChange: (cat: string) => void;
  onDateChange: (date: string) => void;
  onFlowChange: (flow: 'all' | 'revenue' | 'expense') => void;
  onResetFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  dates,
  selectedCategory,
  selectedDate,
  selectedFlow,
  onCategoryChange,
  onDateChange,
  onFlowChange,
  onResetFilters,
  totalCount,
  filteredCount,
}) => {
  const hasActiveFilters = selectedCategory !== 'all' || selectedDate !== 'all' || selectedFlow !== 'all';

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left Filter Inputs */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center space-x-1.5 text-slate-500 font-semibold px-1">
          <Filter className="w-3.5 h-3.5 text-indigo-500" />
          <span>Filter Analysis:</span>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 text-xs outline-hidden cursor-pointer"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Filter */}
        {dates.length > 0 && (
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 text-xs outline-hidden cursor-pointer"
            >
              <option value="all">All Periods ({dates.length})</option>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Flow Type Filter */}
        <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onFlowChange('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              selectedFlow === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFlowChange('revenue')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center space-x-1 ${
              selectedFlow === 'revenue'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <ArrowUpCircle className="w-3 h-3" />
            <span>Income</span>
          </button>
          <button
            type="button"
            onClick={() => onFlowChange('expense')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center space-x-1 ${
              selectedFlow === 'expense'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <ArrowDownCircle className="w-3 h-3" />
            <span>Expenses</span>
          </button>
        </div>
      </div>

      {/* Right Row Count & Reset */}
      <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
        <span className="text-[11px]">
          Showing <strong className="text-slate-700 dark:text-slate-200 font-mono">{filteredCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} rows
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

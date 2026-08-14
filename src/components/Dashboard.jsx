import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  RotateCcw, 
  Download, 
  Sliders, 
  Calendar,
  Sparkles,
  Layers,
  DollarSign
} from 'lucide-react';
import KpiGrid from './KpiGrid';
import ChartsSection from './ChartsSection';
import DataTable from './DataTable';

export default function Dashboard({ 
  data, 
  onReset, 
  onOpenMappingModal, 
  onCurrencyChange 
}) {
  const [granularity, setGranularity] = useState('monthly');

  const {
    filename,
    fileSize,
    totalRows,
    currencySymbol,
    headers,
    mapping,
    rows,
    timeline,
    categories,
    kpis,
    hasCategoryColumn,
  } = data;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-fade-in">
      {/* Top Banner / File Meta Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {filename}
                </h1>
                <div className="flex items-center space-x-3 text-xs text-indigo-200/80 mt-1">
                  <span>{totalRows} records parsed</span>
                  <span>•</span>
                  <span>{formatFileSize(fileSize)}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Auto-analyzed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Currency Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Currency Selector */}
            <div className="flex items-center space-x-1.5 bg-white/10 dark:bg-slate-800/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs">
              <span className="text-indigo-200">Currency:</span>
              <select
                value={currencySymbol}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="bg-transparent text-white font-bold font-mono focus:outline-none cursor-pointer"
              >
                <option value="$" className="text-slate-900">$ USD ($)</option>
                <option value="€" className="text-slate-900">€ EUR (€)</option>
                <option value="₹" className="text-slate-900">₹ INR (₹)</option>
                <option value="£" className="text-slate-900">£ GBP (£)</option>
                <option value="¥" className="text-slate-900">¥ JPY (¥)</option>
                <option value="A$" className="text-slate-900">A$ AUD (A$)</option>
                <option value="C$" className="text-slate-900">C$ CAD (C$)</option>
              </select>
            </div>

            {/* Column Mapping Config */}
            <button
              onClick={onOpenMappingModal}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition backdrop-blur-md"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Map Columns</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={onReset}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 transition backdrop-blur-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Upload New CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. KPI Cards Grid */}
      <section aria-label="Key Performance Indicators">
        <KpiGrid kpis={kpis} currencySymbol={currencySymbol} />
      </section>

      {/* 2. Interactive Charts Section */}
      <section aria-label="Visual Financial Trends">
        <ChartsSection
          timeline={timeline}
          categories={categories}
          currencySymbol={currencySymbol}
          hasCategoryColumn={hasCategoryColumn}
          granularity={granularity}
          setGranularity={setGranularity}
        />
      </section>

      {/* 3. Detailed Data Table */}
      <section aria-label="Data Summary Table">
        <DataTable
          rows={rows}
          currencySymbol={currencySymbol}
          hasCategoryColumn={hasCategoryColumn}
        />
      </section>
    </div>
  );
}

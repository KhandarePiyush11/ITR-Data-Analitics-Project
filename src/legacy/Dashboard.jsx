import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  RotateCcw, 
  Download, 
  Sliders, 
  Calendar,
  Sparkles,
  Layers,
  DollarSign,
  BarChart3,
  SlidersHorizontal,
  Table as TableIcon,
  Printer
} from 'lucide-react';
import KpiGrid from './KpiGrid';
import AiInsightsCard from './AiInsightsCard';
import ChartsSection from './ChartsSection';
import ScenarioSimulator from './ScenarioSimulator';
import DataTable from './DataTable';
import { exportComprehensiveCSV, triggerPrintReport } from '../utils/exportUtils';

export default function Dashboard({ 
  data, 
  onReset, 
  onOpenMappingModal, 
  onCurrencyChange,
  darkMode = false
}) {
  const [granularity, setGranularity] = useState('monthly');
  const [activeMainTab, setActiveMainTab] = useState('charts'); // 'charts', 'simulator', 'table'

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
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-indigo-900/50 print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {filename}
                </h1>
                <div className="flex items-center space-x-3 text-xs text-indigo-200/80 mt-1">
                  <span>{totalRows} entries parsed</span>
                  <span>•</span>
                  <span>{formatFileSize(fileSize)}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Auto-analyzed with ECharts
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Currency Selector */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {/* Currency Selector */}
            <div className="flex items-center space-x-1.5 bg-white/10 dark:bg-slate-800/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs">
              <span className="text-indigo-200 font-medium">Currency:</span>
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

            {/* Export CSV */}
            <button
              onClick={() => exportComprehensiveCSV(rows, kpis, filename)}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition backdrop-blur-md shadow-xs"
              title="Download analyzed CSV export"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Print / PDF */}
            <button
              onClick={triggerPrintReport}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition backdrop-blur-md shadow-xs"
              title="Print executive report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>

            {/* Column Mapping Config */}
            <button
              onClick={onOpenMappingModal}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition backdrop-blur-md shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Columns</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={onReset}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 transition backdrop-blur-md shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. KPI Cards Grid with Apache ECharts Sparklines */}
      <section aria-label="Key Performance Indicators">
        <KpiGrid 
          kpis={kpis} 
          timeline={timeline}
          currencySymbol={currencySymbol} 
          darkMode={darkMode}
        />
      </section>

      {/* 2. AI Executive Health & Strategic Insights Card */}
      <section aria-label="Executive Health Insights">
        <AiInsightsCard
          kpis={kpis}
          timeline={timeline}
          categories={categories}
          currencySymbol={currencySymbol}
        />
      </section>

      {/* Main View Switcher Tabs */}
      <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold print:hidden">
        <button
          type="button"
          onClick={() => setActiveMainTab('charts')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl transition ${
            activeMainTab === 'charts'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Interactive Visual Analytics (Apache ECharts)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('simulator')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl transition ${
            activeMainTab === 'simulator'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
          <span>What-If Financial Scenario Modeler</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('table')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl transition ${
            activeMainTab === 'table'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>Financial Records & Data Explorer</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeMainTab === 'charts' && (
        <section aria-label="Visual Financial Trends">
          <ChartsSection
            timeline={timeline}
            categories={categories}
            currencySymbol={currencySymbol}
            hasCategoryColumn={hasCategoryColumn}
            granularity={granularity}
            setGranularity={setGranularity}
            kpis={kpis}
            rows={rows}
            darkMode={darkMode}
          />
        </section>
      )}

      {activeMainTab === 'simulator' && (
        <section aria-label="Scenario Modeler">
          <ScenarioSimulator
            kpis={kpis}
            currencySymbol={currencySymbol}
            darkMode={darkMode}
          />
        </section>
      )}

      {activeMainTab === 'table' && (
        <section aria-label="Data Summary Table">
          <DataTable
            rows={rows}
            currencySymbol={currencySymbol}
            hasCategoryColumn={hasCategoryColumn}
          />
        </section>
      )}

      {/* Secondary Bottom Data Table in charts mode for complete transparency */}
      {activeMainTab === 'charts' && (
        <section aria-label="Quick Data Ledger">
          <DataTable
            rows={rows}
            currencySymbol={currencySymbol}
            hasCategoryColumn={hasCategoryColumn}
          />
        </section>
      )}
    </div>
  );
}

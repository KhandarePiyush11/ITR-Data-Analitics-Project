import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  AlertCircle, 
  Download, 
  Sparkles, 
  ArrowRight,
  TrendingUp, 
  PieChart, 
  Table, 
  Shield,
  Clipboard,
  Zap,
  Building2,
  ShoppingBag,
  Briefcase,
  UtensilsCrossed
} from 'lucide-react';
import { INDUSTRY_DATASETS, getSampleCsvFile, downloadSampleCsvTemplate } from '../utils/sampleCsvGenerator';

export default function LandingUpload({ 
  onFileSelected, 
  isLoading, 
  errorMessage,
  onOpenPasteModal 
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelected(file);
    }
  };

  const handleTriggerBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const industryIcons = {
    saas: Building2,
    ecommerce: ShoppingBag,
    consulting: Briefcase,
    hospitality: UtensilsCrossed,
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full animate-fade-in space-y-8">
      {/* Hero Badge */}
      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
        <span>Enterprise Financial Intelligence • Apache ECharts Powered</span>
      </div>

      {/* Main Title */}
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Executive Financial Analytics from your{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
            Raw CSV & Excel Data
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Upload any business ledger, QuickBooks export, or sales spreadsheet. Our auto-detecting parser instantly builds interactive Apache ECharts dashboards, AI health grades, and What-If financial simulations.
        </p>
      </div>

      {/* Error Alert Message */}
      {errorMessage && (
        <div className="w-full max-w-2xl p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 flex items-start space-x-3 shadow-sm animate-slide-up">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-rose-900 dark:text-rose-200">Unable to process CSV file</h4>
            <p className="mt-0.5 text-rose-700 dark:text-rose-300 text-xs">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div className="w-full max-w-2xl">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,text/plain,text/tab-separated-values"
          onChange={handleFileInputChange}
          className="hidden"
          id="csv-file-input"
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerBrowse}
          className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center bg-white dark:bg-slate-900/90 shadow-xl ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01] shadow-glow-indigo'
              : 'border-slate-300 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500/80 hover:bg-slate-50/50 dark:hover:bg-slate-900'
          }`}
        >
          <div className="relative flex flex-col items-center">
            {/* Upload Icon Circle */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 ${
                isDragOver
                  ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60'
              }`}
            >
              {isLoading ? (
                <div className="w-8 h-8 border-3 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 animate-subtle-bounce" />
              )}
            </div>

            {/* Prompt Text */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {isLoading ? 'Analyzing Financial Data...' : 'Drag & drop your business CSV file here'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
              or click anywhere in this box to browse from your computer
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                disabled={isLoading}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition transform active:scale-95 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Browse Files</span>
                <ArrowRight className="w-4 h-4 ml-0.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPasteModal();
                }}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition transform active:scale-95 disabled:opacity-50"
              >
                <Clipboard className="w-4 h-4 text-indigo-500" />
                <span>Paste Table Data</span>
              </button>
            </div>

            {/* Privacy Badge */}
            <div className="mt-5 flex items-center space-x-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Client-Side Ingestion: Your financial files never leave your browser</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick-Start 1-Click Industry Templates */}
      <div className="w-full max-w-4xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Or Test with 1-Click Preloaded Industry Models:
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Click any card to launch immediately</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(INDUSTRY_DATASETS).map((ind) => {
            const Icon = industryIcons[ind.id] || Building2;
            return (
              <div
                key={ind.id}
                onClick={() => onFileSelected(getSampleCsvFile(ind.id))}
                className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-lg">{ind.icon}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {ind.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {ind.description}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Launch Live Demo</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Auto-Detection Callout */}
      <div className="w-full max-w-4xl p-5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center space-x-2 font-semibold text-slate-800 dark:text-slate-200 text-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Intelligent Header & Currency Detection</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadSampleCsvTemplate('saas');
            }}
            type="button"
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition shadow-xs text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Template CSV</span>
          </button>
        </div>

        <p className="mb-3 text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
          The engine automatically normalizes columns (Revenue, Expenses, Dates, Categories) and strips currencies ($ USD, € EUR, ₹ INR, £ GBP, ¥ JPY) automatically.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Date Column</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">Date, Period, Month, Day, Time</span>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Revenue / Inflow</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">Sales, Income, Inflow, Turnover</span>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
            <span className="font-bold text-rose-600 dark:text-rose-400 block mb-0.5">Expense / Outflow</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">Cost, Outflow, Payout, Fees, COGS</span>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
            <span className="font-bold text-cyan-600 dark:text-cyan-400 block mb-0.5">Category / Item</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">Department, Product, Channel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

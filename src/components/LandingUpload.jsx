import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  PieChart,
  Table,
  Shield
} from 'lucide-react';
import { downloadSampleCsvTemplate } from '../utils/sampleCsvGenerator';

export default function LandingUpload({ onFileSelected, isLoading, errorMessage }) {
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full animate-fade-in">
      {/* Hero Badge */}
      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
        <span>Instant In-Browser Business Intelligence</span>
      </div>

      {/* Main Title */}
      <div className="text-center max-w-2xl mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Financial Analytics from your{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
            Raw CSV Data
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Upload any business ledger, sales report, or expense export. Our smart parsing engine automatically detects dates, currencies, and metrics to generate executive-ready financial dashboards in seconds.
        </p>
      </div>

      {/* Error Alert Message */}
      {errorMessage && (
        <div className="w-full max-w-2xl mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 flex items-start space-x-3 shadow-sm animate-slide-up">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-rose-900 dark:text-rose-200">Unable to process CSV file</h4>
            <p className="mt-0.5 text-rose-700 dark:text-rose-300">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div className="w-full max-w-2xl">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,application/vnd.ms-excel"
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
          {/* Subtle Corner Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />

          <div className="relative flex flex-col items-center">
            {/* Upload Icon Circle */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-200 ${
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
              or click anywhere in this area to browse from your computer
            </p>

            {/* Action Button */}
            <button
              type="button"
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition transform active:scale-95 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse CSV File</span>
              <ArrowRight className="w-4 h-4 ml-0.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Privacy & Browser-Only Note */}
            <div className="mt-5 flex items-center space-x-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Client-Side Parsing: Your financial data never leaves your browser</span>
            </div>
          </div>
        </div>
      </div>

      {/* Helper Callout: Column Suggestions & Smart Detection */}
      <div className="w-full max-w-2xl mt-8 p-5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center space-x-2 font-semibold text-slate-800 dark:text-slate-200 text-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Smart Auto-Detection Capabilities</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadSampleCsvTemplate();
            }}
            type="button"
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition shadow-xs text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample Business CSV</span>
          </button>
        </div>

        <p className="mb-3 text-slate-500 dark:text-slate-400 leading-relaxed">
          The engine automatically identifies common business headers (case-insensitive) and strips currency symbols ($ € ₹ £):
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Date Column</span>
            <span className="text-slate-500 dark:text-slate-400">Date, Period, Month, Time, Day</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Revenue / Sales</span>
            <span className="text-slate-500 dark:text-slate-400">Revenue, Sales, Income, Earnings</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
            <span className="font-bold text-rose-600 dark:text-rose-400 block mb-0.5">Expense / Costs</span>
            <span className="text-slate-500 dark:text-slate-400">Expenses, Cost, Payout, Outflow</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
            <span className="font-bold text-cyan-600 dark:text-cyan-400 block mb-0.5">Profit / Margin</span>
            <span className="text-slate-500 dark:text-slate-400">Profit, Net, or Auto (Rev - Exp)</span>
          </div>
          <div className="p-2 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 sm:col-span-2">
            <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Category / Product</span>
            <span className="text-slate-500 dark:text-slate-400">Category, Product, Department, Item, Type</span>
          </div>
        </div>
      </div>

      {/* Feature Value Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">KPI Performance</h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Gross Sales, Costs, Net Margin</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Interactive Charts</h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">P&L Combo, Trajectory, Donuts</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/40">
          <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Data Table</h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Search, Sort, Pagination & Export</p>
          </div>
        </div>
      </div>
    </div>
  );
}

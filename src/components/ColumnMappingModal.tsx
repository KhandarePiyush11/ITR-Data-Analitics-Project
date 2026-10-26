/**
 * FinPulse Business Financial Analyzer
 * Executive Column Mapping & Data Schema Inspector Modal
 * 
 * @module components/ColumnMappingModal
 */

import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Database, 
  Check, 
  RotateCcw, 
  DollarSign, 
  Calendar, 
  Tag, 
  Hash, 
  FileText, 
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { ColumnProfile, FinancialKpiSummary, ColumnMappingOverrides, InferredDataType } from '../types';

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  columnList: ColumnProfile[];
  currentKpis: FinancialKpiSummary;
  onApplyMapping: (overrides: ColumnMappingOverrides) => void;
}

const COMMON_CURRENCIES = [
  { symbol: '$', code: 'USD', label: '$ USD (United States Dollar)' },
  { symbol: '€', code: 'EUR', label: '€ EUR (Euro)' },
  { symbol: '₹', code: 'INR', label: '₹ INR (Indian Rupee)' },
  { symbol: '£', code: 'GBP', label: '£ GBP (British Pound)' },
  { symbol: '¥', code: 'JPY', label: '¥ JPY (Japanese Yen)' },
  { symbol: 'C$', code: 'CAD', label: 'C$ CAD (Canadian Dollar)' },
  { symbol: 'A$', code: 'AUD', label: 'A$ AUD (Australian Dollar)' },
];

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  onClose,
  headers,
  columnList,
  currentKpis,
  onApplyMapping,
}) => {
  const [activeTab, setActiveTab] = useState<'mapping' | 'schema'>('mapping');
  const [schemaSearch, setSchemaSearch] = useState('');

  // Form State
  const [dateColumn, setDateColumn] = useState<string>(currentKpis.dateColumn || '');
  const [revenueColumn, setRevenueColumn] = useState<string>(currentKpis.revenueColumn || '');
  const [expenseColumn, setExpenseColumn] = useState<string>(currentKpis.expenseColumn || '');
  const [profitColumn, setProfitColumn] = useState<string>(currentKpis.profitColumn || '');
  const [categoryColumn, setCategoryColumn] = useState<string>(currentKpis.categoryColumn || '');
  const [typeColumn, setTypeColumn] = useState<string>(currentKpis.typeColumn || '');
  const [currencySymbol, setCurrencySymbol] = useState<string>(currentKpis.currencySymbol || '$');

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyMapping({
      dateColumn: dateColumn || undefined,
      revenueColumn: revenueColumn || undefined,
      expenseColumn: expenseColumn || undefined,
      profitColumn: profitColumn || undefined,
      categoryColumn: categoryColumn || undefined,
      typeColumn: typeColumn || undefined,
      currencySymbol: currencySymbol || '$',
    });
    onClose();
  };

  const handleResetToAuto = () => {
    // Auto-detect columns using semantic role matches
    const revCol = columnList.find((c) => c.semanticRole === 'revenue')?.name || '';
    const expCol = columnList.find((c) => c.semanticRole === 'expense')?.name || '';
    const dtCol = columnList.find((c) => c.semanticRole === 'timestamp')?.name || columnList.find((c) => c.inferredType === 'date')?.name || '';
    const catCol = columnList.find((c) => c.semanticRole === 'category')?.name || columnList.find((c) => c.inferredType === 'categorical')?.name || '';
    const pftCol = columnList.find((c) => c.semanticRole === 'profit')?.name || '';
    const typCol = columnList.find((c) => /^(type|txn_type|flow|cr_dr)$/i.test(c.name))?.name || '';

    setDateColumn(dtCol);
    setRevenueColumn(revCol);
    setExpenseColumn(expCol);
    setProfitColumn(pftCol);
    setCategoryColumn(catCol);
    setTypeColumn(typCol);
  };

  const getTypeIcon = (type: InferredDataType) => {
    switch (type) {
      case 'numeric':
        return <Hash className="w-3.5 h-3.5 text-blue-500" />;
      case 'currency':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-amber-500" />;
      case 'categorical':
        return <Tag className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const filteredColumns = columnList.filter(
    (c) =>
      c.name.toLowerCase().includes(schemaSearch.toLowerCase()) ||
      c.inferredType.toLowerCase().includes(schemaSearch.toLowerCase()) ||
      c.semanticRole.toLowerCase().includes(schemaSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] animate-scale-up">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Data Schema & Column Field Mapping
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure metric roles, currency and inspect field distributions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('mapping')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'mapping'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Column Mapping</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'schema'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Schema Profiler ({columnList.length} Columns)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {activeTab === 'mapping' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-200 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>
                  Adjust how FinPulse calculates metrics. You can re-assign any column to Revenue, Expenses, or Dates. For single-column ledgers with positive/negative numbers, select the same column for both or specify a Type column.
                </span>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Display Currency Symbol:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COMMON_CURRENCIES.map((curr) => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => setCurrencySymbol(curr.symbol)}
                      className={`p-2 rounded-xl text-left border transition ${
                        currencySymbol === curr.symbol
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="font-mono text-sm block font-bold">{curr.symbol} {curr.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Date Column */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date / Timeline Column:
                  </label>
                  <select
                    value={dateColumn}
                    onChange={(e) => setDateColumn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  >
                    <option value="">-- None / Auto Sequential Dates --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Column */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category / Department / Item Column:
                  </label>
                  <select
                    value={categoryColumn}
                    onChange={(e) => setCategoryColumn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  >
                    <option value="">-- None / Auto Inferred --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Revenue / Inflow Column */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Revenue / Inflow / Sales Column:</span>
                  </label>
                  <select
                    value={revenueColumn}
                    onChange={(e) => setRevenueColumn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  >
                    <option value="">-- None --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Expense / Outflow Column */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center space-x-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                    <span>Expenses / Outflows Column:</span>
                  </label>
                  <select
                    value={expenseColumn}
                    onChange={(e) => setExpenseColumn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  >
                    <option value="">-- None (Single-column ledger) --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Profit Column (Optional) */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Net Profit Column (Optional):
                  </label>
                  <select
                    value={profitColumn}
                    onChange={(e) => setProfitColumn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  >
                    <option value="">-- Auto Calculate (Revenue - Expenses) --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transaction Type Column */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction Type Column (Debit/Credit, Income/Expense):
                  </label>
                  <select
                    value={typeColumn}
                    onChange={(e) => setTypeColumn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  >
                    <option value="">-- None / Sign-based Inflow & Outflow --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Schema Profiler Tab */
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search columns by name, type, or role..."
                value={schemaSearch}
                onChange={(e) => setSchemaSearch(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
              />

              <div className="space-y-2.5">
                {filteredColumns.map((col) => (
                  <div
                    key={col.name}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-lg bg-white dark:bg-slate-800">
                          {getTypeIcon(col.inferredType)}
                        </div>
                        <div>
                          <strong className="text-slate-900 dark:text-white font-semibold">{col.name}</strong>
                          <span className="text-[10px] text-slate-400 ml-2">#{col.index + 1}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          {col.inferredType}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          {col.semanticRole}
                        </span>
                      </div>
                    </div>

                    {col.numericStats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Min / Max:</span>
                          <span className="font-mono">{col.numericStats.min.toLocaleString()} — {col.numericStats.max.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Average:</span>
                          <span className="font-mono">{col.numericStats.mean.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Sum:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{col.numericStats.sum.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Null Count:</span>
                          <span>{col.nullCount} ({col.nullPercentage}%)</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={handleResetToAuto}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Auto-Detect Fields</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Mappings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

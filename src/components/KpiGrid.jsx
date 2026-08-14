import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Percent, 
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export default function KpiGrid({ kpis, currencySymbol }) {
  const isProfitable = kpis.netProfit >= 0;
  const expenseRatio = kpis.totalRevenue > 0 ? (kpis.totalExpenses / kpis.totalRevenue) * 100 : 0;
  const profitablePercentage = kpis.totalTransactions > 0 
    ? (kpis.profitableRowsCount / kpis.totalTransactions) * 100 
    : 0;

  return (
    <div className="space-y-4">
      {/* Primary 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Revenue Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(kpis.totalRevenue, currencySymbol)}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center font-medium text-emerald-600 dark:text-emerald-400 mr-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                Gross Inflow
              </span>
              <span>across {kpis.totalTransactions} records</span>
            </div>
          </div>

          {/* Accent bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600" />
        </div>

        {/* 2. Total Expenses Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Expenses
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(kpis.totalExpenses, currencySymbol)}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center font-medium text-slate-600 dark:text-slate-300 mr-1.5">
                {expenseRatio.toFixed(1)}%
              </span>
              <span>of total revenue</span>
            </div>
          </div>

          {/* Accent bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-600" />
        </div>

        {/* 3. Net Profit / Loss Card (Highlighted Green/Red) */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-200 ${
            isProfitable
              ? 'bg-gradient-to-br from-emerald-50/70 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border-emerald-200 dark:border-emerald-800/80 shadow-glow-emerald'
              : 'bg-gradient-to-br from-rose-50/70 via-white to-white dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900 border-rose-200 dark:border-rose-800/80 shadow-glow-rose'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {isProfitable ? 'Net Profit' : 'Net Loss'}
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isProfitable
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isProfitable ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
          </div>

          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isProfitable
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(kpis.netProfit, currencySymbol)}
            </div>
            <div className="mt-2 flex items-center space-x-1.5 text-xs">
              <span
                className={`inline-flex items-center font-bold px-2 py-0.5 rounded-full text-[11px] ${
                  isProfitable
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}
              >
                {isProfitable ? 'Profitable' : 'Net Deficit'}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Revenue − Costs
              </span>
            </div>
          </div>

          {/* Accent bottom line */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 ${
              isProfitable ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
        </div>

        {/* 4. Net Profit Margin (%) Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Profit Margin
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3">
            <div
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                kpis.profitMargin >= 20
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : kpis.profitMargin >= 0
                  ? 'text-slate-900 dark:text-white'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatPercentage(kpis.profitMargin, true, 1)}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center font-medium text-slate-700 dark:text-slate-300 mr-1.5">
                (Net / Revenue) × 100
              </span>
              <span>
                {kpis.profitMargin >= 20 ? 'Strong health' : kpis.profitMargin >= 0 ? 'Moderate' : 'Under pressure'}
              </span>
            </div>
          </div>

          {/* Accent bottom line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500" />
        </div>
      </div>

      {/* Secondary Quick Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="px-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Avg Transaction Profit</span>
          <span className={`font-bold font-mono ${kpis.avgTransactionProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(kpis.avgTransactionProfit, currencySymbol)}
          </span>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Profitable Rows</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
            {kpis.profitableRowsCount} / {kpis.totalTransactions} ({profitablePercentage.toFixed(0)}%)
          </span>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Expense-to-Revenue</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
            {expenseRatio.toFixed(1)}%
          </span>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Total Records</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
            {kpis.totalTransactions} entries
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * FinPulse Business Financial Analyzer
 * Executive KPI Overview Cards
 * 
 * @module components/KpiOverview
 */

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  Percent, 
  Receipt 
} from 'lucide-react';
import { FinancialKpiSummary } from '../types';

interface KpiOverviewProps {
  kpis: FinancialKpiSummary;
}

export const KpiOverview: React.FC<KpiOverviewProps> = ({ kpis }) => {
  const {
    currencySymbol,
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMarginPercent,
    totalTax,
    effectiveTaxRatePercent,
    averageTransactionValue,
    transactionCount,
    profitableTransactionsCount,
  } = kpis;

  const isProfitable = netProfit >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Revenue Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Revenue
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {currencySymbol}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {transactionCount.toLocaleString()}
          </span>
          <span>total recorded entries</span>
        </div>
      </div>

      {/* 2. Total Expenses Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Operating Expenses
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {currencySymbol}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>Expense Ratio:</span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>

      {/* 3. Net Profit / Loss Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Net Income / Profit
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isProfitable
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
            }`}
          >
            {isProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <h3
            className={`text-2xl sm:text-3xl font-extrabold ${
              isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isProfitable ? '+' : ''}{currencySymbol}{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {profitableTransactionsCount}
          </span>
          <span>positive cashflow rows</span>
        </div>
      </div>

      {/* 4. Net Margin or Tax Liability Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {totalTax > 0 ? 'Tax & Withholding' : 'Net Profit Margin'}
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            {totalTax > 0 ? <Receipt className="w-4 h-4" /> : <Percent className="w-4 h-4" />}
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalTax > 0 
              ? `${currencySymbol}${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `${profitMarginPercent.toFixed(1)}%`}
          </h3>
        </div>
        <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          {totalTax > 0 ? (
            <>
              <span>Effective Tax Rate:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {effectiveTaxRatePercent.toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span>Avg Value / Transaction:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {currencySymbol}{averageTransactionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

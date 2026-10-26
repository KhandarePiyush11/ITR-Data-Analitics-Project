/**
 * FinPulse Business Financial Analyzer
 * Real-Data Financial Insights & Performance Highlights
 * 
 * @module components/FinancialInsights
 */

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Wallet
} from 'lucide-react';
import { FinancialKpiSummary, UnifiedDataset } from '../types';
import { cleanNumericValue } from '../analyzer/typeInference';

interface FinancialInsightsProps {
  kpis: FinancialKpiSummary;
  dataset: UnifiedDataset;
}

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({ kpis, dataset }) => {
  const { 
    currencySymbol, 
    totalRevenue, 
    totalExpenses, 
    netProfit, 
    profitMarginPercent,
    categoryColumn,
    expenseColumn,
    revenueColumn,
    dateColumn,
    transactionCount,
    profitableTransactionsCount,
  } = kpis;

  // Real data-driven financial insights
  const analysis = useMemo(() => {
    const { rows } = dataset;
    if (!rows || rows.length === 0) return null;

    // 1. Calculate Top Expense Category
    let topExpenseCategory = '';
    let topExpenseAmount = 0;

    if (categoryColumn && expenseColumn) {
      const expenseByCategory: Record<string, number> = {};
      rows.forEach((r) => {
        const cat = String(r[categoryColumn] || 'Uncategorized').trim();
        const exp = Math.abs(cleanNumericValue(r[expenseColumn]) || 0);
        expenseByCategory[cat] = (expenseByCategory[cat] || 0) + exp;
      });

      for (const [cat, val] of Object.entries(expenseByCategory)) {
        if (val > topExpenseAmount) {
          topExpenseAmount = val;
          topExpenseCategory = cat;
        }
      }
    }

    // 2. Calculate Top Revenue Category
    let topRevenueCategory = '';
    let topRevenueAmount = 0;

    if (categoryColumn && revenueColumn) {
      const revByCategory: Record<string, number> = {};
      rows.forEach((r) => {
        const cat = String(r[categoryColumn] || 'Uncategorized').trim();
        const rev = cleanNumericValue(r[revenueColumn]) || 0;
        revByCategory[cat] = (revByCategory[cat] || 0) + rev;
      });

      for (const [cat, val] of Object.entries(revByCategory)) {
        if (val > topRevenueAmount) {
          topRevenueAmount = val;
          topRevenueCategory = cat;
        }
      }
    }

    // 3. Peak Revenue Period
    let peakPeriod = '';
    let peakPeriodAmount = 0;

    if (dateColumn && revenueColumn) {
      const revByDate: Record<string, number> = {};
      rows.forEach((r) => {
        const d = String(r[dateColumn] || '').trim();
        const rev = cleanNumericValue(r[revenueColumn]) || 0;
        if (d) {
          revByDate[d] = (revByDate[d] || 0) + rev;
        }
      });

      for (const [d, val] of Object.entries(revByDate)) {
        if (val > peakPeriodAmount) {
          peakPeriodAmount = val;
          peakPeriod = d;
        }
      }
    }

    const expenseSharePct = totalExpenses > 0 && topExpenseAmount > 0
      ? Math.round((topExpenseAmount / totalExpenses) * 100)
      : 0;

    const revenueSharePct = totalRevenue > 0 && topRevenueAmount > 0
      ? Math.round((topRevenueAmount / totalRevenue) * 100)
      : 0;

    const profitableRatio = transactionCount > 0
      ? Math.round((profitableTransactionsCount / transactionCount) * 100)
      : 0;

    return {
      topExpenseCategory,
      topExpenseAmount,
      expenseSharePct,
      topRevenueCategory,
      topRevenueAmount,
      revenueSharePct,
      peakPeriod,
      peakPeriodAmount,
      profitableRatio,
    };
  }, [dataset, kpis]);

  if (!analysis) return null;

  const isProfitable = netProfit >= 0;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <span>Key Financial Highlights</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculated key observations from transaction ledger
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
              isProfitable
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {isProfitable ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{isProfitable ? 'Net Profitable' : 'Operating Deficit'}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Insight 1: Largest Cost Driver */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            <Wallet className="w-4 h-4 text-rose-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Primary Cost Driver</span>
          </div>
          {analysis.topExpenseCategory ? (
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {analysis.topExpenseCategory}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                {currencySymbol}{analysis.topExpenseAmount.toLocaleString()} ({analysis.expenseSharePct}% of total expenses)
              </p>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">Expense categories not specified in dataset</p>
          )}
        </div>

        {/* Insight 2: Primary Revenue Source */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Primary Revenue Source</span>
          </div>
          {analysis.topRevenueCategory ? (
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {analysis.topRevenueCategory}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                {currencySymbol}{analysis.topRevenueAmount.toLocaleString()} ({analysis.revenueSharePct}% of total revenue)
              </p>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">Revenue categories not specified in dataset</p>
          )}
        </div>

        {/* Insight 3: Profit Margin & Cashflow Consistency */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Margin & Cashflow</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {profitMarginPercent.toFixed(1)}% Operating Margin
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              {analysis.profitableRatio}% of transactions generated positive net cashflow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

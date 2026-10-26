import React from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export default function CustomChartTooltip({ 
  active, 
  payload, 
  label, 
  currencySymbol = '$', 
  isDonut = false 
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  if (isDonut) {
    const data = payload[0];
    return (
      <div className="rounded-xl bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl border border-slate-200 dark:border-slate-800 backdrop-blur-md text-xs min-w-[170px] animate-fade-in">
        <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center space-x-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: data.payload?.fill || data.color }}
          />
          <span className="truncate">{data.name}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>Amount:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {formatCurrency(data.value, currencySymbol)}
          </span>
        </div>
        {data.payload?.count !== undefined && (
          <div className="mt-0.5 flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Transactions:</span>
            <span className="font-mono">{data.payload.count}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl border border-slate-200 dark:border-slate-800 backdrop-blur-md text-xs min-w-[210px] animate-fade-in">
      <div className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">
        {label || 'Financial Period'}
      </div>

      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const isProfit = entry.dataKey === 'profit' || entry.name?.toLowerCase().includes('profit');
          const isExpense = entry.dataKey === 'expense' || entry.name?.toLowerCase().includes('expense');
          const isRevenue = entry.dataKey === 'revenue' || entry.name?.toLowerCase().includes('revenue');
          const isCumulative = entry.dataKey === 'cumulativeProfit';
          const isMargin = entry.dataKey === 'profitMargin';

          let valDisplay = '';
          if (isMargin) {
            valDisplay = formatPercentage(entry.value, true, 1);
          } else {
            valDisplay = formatCurrency(entry.value, currencySymbol);
          }

          let labelColor = 'text-slate-700 dark:text-slate-300';
          if (isProfit || isCumulative) {
            labelColor = entry.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
          } else if (isExpense) {
            labelColor = 'text-rose-500 dark:text-rose-400';
          } else if (isRevenue) {
            labelColor = 'text-indigo-600 dark:text-indigo-400';
          }

          return (
            <div key={`tooltip-${index}`} className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-500 dark:text-slate-400 capitalize">
                  {entry.name || entry.dataKey}:
                </span>
              </div>
              <span className={`font-mono font-bold ${labelColor}`}>
                {valDisplay}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

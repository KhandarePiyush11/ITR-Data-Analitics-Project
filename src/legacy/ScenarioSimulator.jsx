import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  SlidersHorizontal, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  RotateCcw, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { getChartTheme } from '../utils/echartsOptions';

export default function ScenarioSimulator({ kpis, currencySymbol = '$', darkMode = false }) {
  const [revenueChange, setRevenueChange] = useState(15); // +15% default
  const [expenseChange, setExpenseChange] = useState(-10); // -10% default
  const [taxRate, setTaxRate] = useState(0); // 0% default

  // Base metrics
  const baseRevenue = kpis.totalRevenue;
  const baseExpenses = kpis.totalExpenses;
  const baseProfit = kpis.netProfit;
  const baseMargin = kpis.profitMargin;

  // Simulated metrics
  const simRevenue = Math.max(0, baseRevenue * (1 + revenueChange / 100));
  const simExpenses = Math.max(0, baseExpenses * (1 + expenseChange / 100));
  const preTaxProfit = simRevenue - simExpenses;
  const taxAmount = preTaxProfit > 0 ? preTaxProfit * (taxRate / 100) : 0;
  const simNetProfit = preTaxProfit - taxAmount;
  const simMargin = simRevenue > 0 ? (simNetProfit / simRevenue) * 100 : 0;

  const profitDelta = simNetProfit - baseProfit;
  const isGain = profitDelta >= 0;

  const handleReset = () => {
    setRevenueChange(0);
    setExpenseChange(0);
    setTaxRate(0);
  };

  // ECharts Comparison Option
  const comparisonOption = useMemo(() => {
    const theme = getChartTheme(darkMode);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: theme.textColor, fontSize: 12 },
        extraCssText: 'border-radius: 12px;',
        formatter: (params) => {
          let html = `<div style="font-weight: 700; color: ${darkMode ? '#fff' : '#0f172a'}; margin-bottom: 6px;">${params[0].axisValue}</div>`;
          params.forEach((item) => {
            html += `
              <div style="display: flex; justify-content: space-between; gap: 16px; margin: 3px 0;">
                <span style="color: ${theme.mutedText};">${item.seriesName}:</span>
                <span style="font-weight: 700; font-family: monospace; color: ${item.color};">${formatCurrency(item.value, currencySymbol)}</span>
              </div>
            `;
          });
          return html;
        },
      },
      legend: {
        data: ['Actual Baseline', 'Simulated Projection'],
        top: 0,
        textStyle: { color: theme.textColor, fontSize: 11 },
        icon: 'roundRect',
      },
      grid: {
        left: '3%',
        right: '4%',
        top: 40,
        bottom: 25,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: ['Total Revenue', 'Total Expenses', 'Net Profit'],
        axisLine: { lineStyle: { color: theme.borderColor } },
        axisTick: { show: false },
        axisLabel: { color: theme.textColor, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: theme.splitLineColor, type: 'dashed' } },
        axisLabel: {
          color: theme.mutedText,
          formatter: (val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`,
        },
      },
      series: [
        {
          name: 'Actual Baseline',
          type: 'bar',
          data: [baseRevenue, baseExpenses, baseProfit],
          barMaxWidth: 36,
          itemStyle: {
            color: '#94a3b8',
            borderRadius: [6, 6, 0, 0],
          },
        },
        {
          name: 'Simulated Projection',
          type: 'bar',
          data: [simRevenue, simExpenses, simNetProfit],
          barMaxWidth: 36,
          itemStyle: {
            color: (params) => {
              if (params.dataIndex === 0) return '#6366f1'; // Revenue
              if (params.dataIndex === 1) return '#f43f5e'; // Expense
              return simNetProfit >= 0 ? '#10b981' : '#e11d48'; // Profit
            },
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    };
  }, [baseRevenue, baseExpenses, baseProfit, simRevenue, simExpenses, simNetProfit, currencySymbol, darkMode]);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Interactive "What-If" Financial Modeler
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
              Real-Time Simulation
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Test strategic decisions by adjusting revenue targets and cost containment initiatives to see projected net earnings in real time.
          </p>
        </div>

        <button
          onClick={handleReset}
          type="button"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sliders</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
        {/* Slider 1: Revenue Target Growth */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Revenue Growth Target:
            </span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded-lg text-xs ${revenueChange >= 0 ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}`}>
              {revenueChange >= 0 ? '+' : ''}{revenueChange}%
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="100"
            step="1"
            value={revenueChange}
            onChange={(e) => setRevenueChange(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>-50%</span>
            <span>0% (Baseline)</span>
            <span>+100%</span>
          </div>
        </div>

        {/* Slider 2: Cost Reduction Target */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Expense Optimization:
            </span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded-lg text-xs ${expenseChange <= 0 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}`}>
              {expenseChange >= 0 ? '+' : ''}{expenseChange}%
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={expenseChange}
            onChange={(e) => setExpenseChange(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>-50% (Cut costs)</span>
            <span>0% (Baseline)</span>
            <span>+50% (Inflation)</span>
          </div>
        </div>

        {/* Slider 3: Optional Tax / Contingency */}
        <div className="space-y-2 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Tax / Contingency Buffer:
            </span>
            <span className="font-mono font-bold px-2 py-0.5 rounded-lg text-xs bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
              {taxRate}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="1"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-full accent-cyan-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0%</span>
            <span>20% (Avg)</span>
            <span>40% (High)</span>
          </div>
        </div>
      </div>

      {/* Outcome Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Projected Revenue */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Projected Revenue
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatCurrency(simRevenue, currencySymbol)}
          </div>
          <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            {revenueChange >= 0 ? `+${revenueChange}% growth` : `${revenueChange}% drop`}
          </div>
        </div>

        {/* Card 2: Projected Expenses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Projected Expenses
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatCurrency(simExpenses, currencySymbol)}
          </div>
          <div className="mt-1 text-xs text-rose-500 font-medium">
            {expenseChange <= 0 ? `${Math.abs(expenseChange)}% reduction` : `+${expenseChange}% inflation`}
          </div>
        </div>

        {/* Card 3: Projected Net Profit */}
        <div className={`p-4 rounded-2xl border shadow-xs ${simNetProfit >= 0 ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80' : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/80'}`}>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Projected Net Profit
          </span>
          <div className={`text-xl font-bold font-mono mt-1 ${simNetProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(simNetProfit, currencySymbol)}
          </div>
          <div className="mt-1 text-xs font-semibold flex items-center">
            {isGain ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                +{formatCurrency(profitDelta, currencySymbol)} vs Actual
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center">
                <TrendingDown className="w-3.5 h-3.5 mr-1" />
                {formatCurrency(profitDelta, currencySymbol)} vs Actual
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Projected Margin */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Projected Margin
          </span>
          <div className={`text-xl font-bold font-mono mt-1 ${simMargin >= 20 ? 'text-emerald-600 dark:text-emerald-400' : simMargin >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
            {formatPercentage(simMargin, true, 1)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Baseline: <strong className="font-mono">{formatPercentage(baseMargin, true, 1)}</strong>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="w-full h-80 pt-2">
        <ReactECharts
          option={comparisonOption}
          style={{ height: '320px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    </div>
  );
}

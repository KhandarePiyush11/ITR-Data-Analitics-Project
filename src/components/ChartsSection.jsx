import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Calendar, 
  Layers, 
  Filter,
  ArrowRight
} from 'lucide-react';
import CustomChartTooltip from './CustomChartTooltip';
import { formatCompactCurrency, formatCurrency } from '../utils/formatters';

// Modern curated chart palette
const CATEGORY_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#3b82f6', // Blue
  '#64748b', // Slate
];

export default function ChartsSection({ 
  timeline, 
  categories, 
  currencySymbol, 
  hasCategoryColumn, 
  granularity, 
  setGranularity 
}) {
  const [activeDonutType, setActiveDonutType] = useState('expense'); // 'expense' or 'revenue'
  const [chartViewMode, setChartViewMode] = useState('both'); // 'both' (Combo + Trajectory) or 'combo' or 'trajectory'

  // Pick dataset based on selected granularity
  const chartData = timeline[granularity] || timeline.monthly || timeline.raw;

  const donutData =
    activeDonutType === 'expense'
      ? categories.expenseCategories
      : categories.revenueCategories;

  const totalDonutValue = donutData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Granularity Switcher & Chart Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Time Granularity:
          </span>
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            {['monthly', 'quarterly', 'yearly', 'daily', 'raw'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition ${
                  granularity === g
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Displaying:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
            {chartData.length} periods
          </span>
        </div>
      </div>

      {/* Primary Chart 1: Profit & Loss Overview (Combo Bar + Line) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Profit & Loss Overview
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Revenue (bars) vs. Expenses (bars) with Net Profit trendline
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-indigo-500" />
              <span className="text-slate-600 dark:text-slate-400">Revenue</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-400">Expenses</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Net Profit</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
              <XAxis
                dataKey="period"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                dy={8}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCompactCurrency(val, currencySymbol)}
                width={65}
              />
              <Tooltip content={<CustomChartTooltip currencySymbol={currencySymbol} />} />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="url(#revGrad)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="expense"
                name="Expenses"
                fill="url(#expGrad)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Net Profit"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid for Chart 2 (Cumulative Trajectory) and Chart 3 (Category Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 2: Cumulative Profitability Trajectory */}
        <div className={`${hasCategoryColumn ? 'lg:col-span-7' : 'lg:col-span-12'} rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm`}>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cumulative Profitability Trajectory
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total accumulated net income/loss growth over the timeline
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="cumProfitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" vertical={false} />
                <XAxis
                  dataKey="period"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  dy={8}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatCompactCurrency(val, currencySymbol)}
                  width={65}
                />
                <Tooltip content={<CustomChartTooltip currencySymbol={currencySymbol} />} />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="Cumulative Profit"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cumProfitGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Category Breakdown Donut (if categories present) */}
        {hasCategoryColumn && (
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <PieIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Category Breakdown
                  </h3>
                </div>

                {/* Donut Type Toggle */}
                <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveDonutType('expense')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      activeDonutType === 'expense'
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Expenses
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDonutType('revenue')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      activeDonutType === 'revenue'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Revenue
                  </button>
                </div>
              </div>

              {donutData.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-xs text-slate-400">
                  No categorical breakdown available for {activeDonutType}.
                </div>
              ) : (
                <div className="h-52 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            stroke="transparent"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip currencySymbol={currencySymbol} isDonut={true} />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Total Callout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      Total
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {formatCompactCurrency(totalDonutValue, currencySymbol)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Donut Legend Items */}
            {donutData.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 max-h-28 overflow-y-auto pr-1 text-[11px]">
                {donutData.slice(0, 6).map((item, index) => {
                  const share = totalDonutValue > 0 ? (item.value / totalDonutValue) * 100 : 0;
                  return (
                    <div key={`legend-${index}`} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1.5 truncate mr-1">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                        />
                        <span className="truncate" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 flex-shrink-0">
                        {share.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

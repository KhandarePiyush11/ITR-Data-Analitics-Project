import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Calendar, 
  Layers, 
  Sparkles,
  Compass,
  GitCommit,
  ScatterChart,
  Grid,
  Maximize2
} from 'lucide-react';
import {
  getOverviewOption,
  getCumulativeTrajectoryOption,
  getCategoryDonutOption,
  getCategoryTreemapOption,
  getFinancialRadarOption,
  getWaterfallOption,
  getScatterCorrelationOption,
} from '../utils/echartsOptions';
import { formatCompactCurrency } from '../utils/formatters';

export default function ChartsSection({ 
  timeline, 
  categories, 
  currencySymbol, 
  hasCategoryColumn, 
  granularity, 
  setGranularity,
  kpis,
  rows,
  darkMode = false
}) {
  const [activeDonutType, setActiveDonutType] = useState('expense'); // 'expense' or 'revenue'
  const [categoryViewStyle, setCategoryViewStyle] = useState('donut'); // 'donut' or 'treemap'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'radar', 'waterfall', 'scatter'

  // Pick dataset based on selected granularity
  const chartData = timeline[granularity] || timeline.monthly || timeline.raw;

  const donutData =
    activeDonutType === 'expense'
      ? categories.expenseCategories
      : categories.revenueCategories;

  const totalDonutValue = donutData.reduce((acc, curr) => acc + curr.value, 0);

  // ECharts Options
  const overviewOption = useMemo(
    () => getOverviewOption(chartData, currencySymbol, darkMode),
    [chartData, currencySymbol, darkMode]
  );

  const cumulativeOption = useMemo(
    () => getCumulativeTrajectoryOption(chartData, currencySymbol, darkMode),
    [chartData, currencySymbol, darkMode]
  );

  const categoryDonutOption = useMemo(
    () =>
      getCategoryDonutOption(
        donutData,
        activeDonutType === 'expense' ? 'Expenses' : 'Revenue',
        currencySymbol,
        darkMode
      ),
    [donutData, activeDonutType, currencySymbol, darkMode]
  );

  const categoryTreemapOption = useMemo(
    () =>
      getCategoryTreemapOption(
        donutData,
        activeDonutType === 'expense' ? 'Expenses' : 'Revenue',
        currencySymbol,
        darkMode
      ),
    [donutData, activeDonutType, currencySymbol, darkMode]
  );

  const radarOption = useMemo(
    () => getFinancialRadarOption(kpis, rows, currencySymbol, darkMode),
    [kpis, rows, currencySymbol, darkMode]
  );

  const waterfallOption = useMemo(
    () => getWaterfallOption(kpis, categories, currencySymbol, darkMode),
    [kpis, categories, currencySymbol, darkMode]
  );

  const scatterOption = useMemo(
    () => getScatterCorrelationOption(rows, currencySymbol, darkMode),
    [rows, currencySymbol, darkMode]
  );

  return (
    <div className="space-y-6">
      {/* Controls Bar: Granularity Switcher & Analytics Tab Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Time Granularity Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mr-1">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Granularity:</span>
          </div>
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

        {/* Analytics Mode Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Overview & Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Health Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('waterfall')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'waterfall'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Waterfall Bridge</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scatter')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === 'scatter'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ScatterChart className="w-3.5 h-3.5" />
            <span>Outlier Matrix</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW & TRENDS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Primary Chart 1: Profit & Loss Overview (Apache ECharts Combo) */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Profit & Loss Overview
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                    Apache ECharts
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Revenue (Indigo bars) vs. Expenses (Rose bars) with interactive Net Profit trendline and zoom slider
                </p>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                {chartData.length} timeline bins
              </div>
            </div>

            <div className="w-full h-84">
              <ReactECharts
                option={overviewOption}
                style={{ height: '340px', width: '100%' }}
                opts={{ renderer: 'canvas' }}
                notMerge={true}
                lazyUpdate={true}
              />
            </div>
          </div>

          {/* Grid for Chart 2 (Cumulative Trajectory) and Chart 3 (Category Breakdown) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 2: Cumulative Profitability Trajectory */}
            <div
              className={`${
                hasCategoryColumn ? 'lg:col-span-7' : 'lg:col-span-12'
              } rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Cumulative Wealth Trajectory
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Accumulated net earnings wave with peak and drawdown markers
                  </p>
                </div>
              </div>

              <div className="w-full h-72">
                <ReactECharts
                  option={cumulativeOption}
                  style={{ height: '290px', width: '100%' }}
                  opts={{ renderer: 'canvas' }}
                  notMerge={true}
                  lazyUpdate={true}
                />
              </div>
            </div>

            {/* Chart 3: Category Breakdown (Donut / Treemap Switchable) */}
            {hasCategoryColumn && (
              <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <PieIcon className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Category Share
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Donut vs Treemap View Toggle */}
                      <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                        <button
                          type="button"
                          onClick={() => setCategoryViewStyle('donut')}
                          className={`p-1 rounded-md transition ${
                            categoryViewStyle === 'donut'
                              ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                          title="Donut View"
                        >
                          <PieIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryViewStyle('treemap')}
                          className={`p-1 rounded-md transition ${
                            categoryViewStyle === 'treemap'
                              ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                          title="Treemap View"
                        >
                          <Grid className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Donut Type Toggle */}
                      <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                        <button
                          type="button"
                          onClick={() => setActiveDonutType('expense')}
                          className={`px-2 py-1 rounded-md font-semibold transition ${
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
                          className={`px-2 py-1 rounded-md font-semibold transition ${
                            activeDonutType === 'revenue'
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Revenue
                        </button>
                      </div>
                    </div>
                  </div>

                  {donutData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                      No categorical data available for {activeDonutType}.
                    </div>
                  ) : (
                    <div className="w-full h-72">
                      <ReactECharts
                        option={
                          categoryViewStyle === 'donut'
                            ? categoryDonutOption
                            : categoryTreemapOption
                        }
                        style={{ height: '290px', width: '100%' }}
                        opts={{ renderer: 'canvas' }}
                        notMerge={true}
                        lazyUpdate={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL HEALTH RADAR */}
      {activeTab === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    5-Pillar Financial Health Radar
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Multi-dimensional diagnosis evaluating Margin, Cost Discipline, Win Ratio, Scale, and Stability
                </p>
              </div>
            </div>

            <div className="w-full h-96">
              <ReactECharts
                option={radarOption}
                style={{ height: '380px', width: '100%' }}
                opts={{ renderer: 'canvas' }}
                notMerge={true}
                lazyUpdate={true}
              />
            </div>
          </div>

          {/* Diagnostic Key Takeaways */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-900/10 via-white to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/70 dark:border-indigo-800/60 p-5 shadow-sm">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Executive Diagnostic</span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Margin Quality Score
                  </div>
                  <div className="mt-1 text-slate-500 dark:text-slate-400">
                    Net profit margin is currently <strong className="text-indigo-600 dark:text-indigo-400">{kpis.profitMargin.toFixed(1)}%</strong>. {kpis.profitMargin >= 20 ? 'Consistently high margin provides robust protection against volatility.' : 'Opportunity to optimize operational overhead to expand margins.'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Transaction Win Rate
                  </div>
                  <div className="mt-1 text-slate-500 dark:text-slate-400">
                    <strong className="text-emerald-600 dark:text-emerald-400">{((kpis.profitableRowsCount / (kpis.totalTransactions || 1)) * 100).toFixed(0)}%</strong> of all parsed entries generated positive contribution margin.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Expense Absorption Ratio
                  </div>
                  <div className="mt-1 text-slate-500 dark:text-slate-400">
                    Expenses represent <strong className="text-rose-500">{kpis.totalRevenue > 0 ? ((kpis.totalExpenses / kpis.totalRevenue) * 100).toFixed(1) : 0}%</strong> of gross inflow.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WATERFALL BRIDGE ANALYSIS */}
      {activeTab === 'waterfall' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <GitCommit className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Waterfall Net Margin Bridge
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Visualizing how Gross Revenue is reduced by categorized expenditures to arrive at the final Net Profit
              </p>
            </div>
          </div>

          <div className="w-full h-96">
            <ReactECharts
              option={waterfallOption}
              style={{ height: '380px', width: '100%' }}
              opts={{ renderer: 'canvas' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>
      )}

      {/* TAB 4: TRANSACTION SCATTER & OUTLIER MATRIX */}
      {activeTab === 'scatter' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ScatterChart className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Revenue vs. Expense Correlation Matrix
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Each node represents an individual record. Bubble size reflects net profit magnitude. Hover nodes for deep transaction inspection.
              </p>
            </div>
          </div>

          <div className="w-full h-96">
            <ReactECharts
              option={scatterOption}
              style={{ height: '380px', width: '100%' }}
              opts={{ renderer: 'canvas' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

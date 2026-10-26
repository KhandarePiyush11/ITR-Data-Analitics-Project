/**
 * FinPulse Business Financial Analyzer
 * Adaptive ECharts Widget with Interactive Controls
 * 
 * @module components/ChartWidget
 */

import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  BarChart2, 
  LineChart, 
  PieChart, 
  SlidersHorizontal, 
  Layers, 
  Sigma, 
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  UnifiedDataset, 
  ColumnProfile, 
  ActiveChartConfig, 
  ChartType, 
  AggregationFunction 
} from '../types';
import { useDynamicCharts } from '../hooks/useDynamicCharts';

interface ChartWidgetProps {
  dataset: UnifiedDataset;
  columnList: ColumnProfile[];
  initialConfig: ActiveChartConfig;
  isDarkMode: boolean;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  dataset,
  columnList,
  initialConfig,
  isDarkMode,
}) => {
  const [config, setConfig] = useState<ActiveChartConfig>({
    ...initialConfig,
    showTrendline: initialConfig.showTrendline ?? true,
  });
  const [showControls, setShowControls] = useState(false);

  // Sync internal configuration whenever a new file or sheet recommendation is loaded
  useEffect(() => {
    setConfig({
      ...initialConfig,
      showTrendline: initialConfig.showTrendline ?? true,
    });
  }, [initialConfig.id, initialConfig.dimensionKey, initialConfig.metricKeys]);

  const { echartsOption, trendAnalysis } = useDynamicCharts(dataset, config, isDarkMode);

  const numericColumns = columnList.filter(
    (c) => c.inferredType === 'numeric' || c.inferredType === 'currency'
  );
  const categoricalOrDateColumns = columnList.filter(
    (c) => c.inferredType === 'date' || c.inferredType === 'categorical' || c.inferredType === 'text'
  );

  const chartTypes: Array<{ type: ChartType; label: string; icon: any }> = [
    { type: 'line', label: 'Clean Trend Line', icon: LineChart },
    { type: 'area', label: 'Soft Area', icon: LineChart },
    { type: 'bar', label: 'Bar Comparison', icon: BarChart2 },
    { type: 'stacked_bar', label: 'Stacked Multi-Metric', icon: Layers },
    { type: 'donut', label: 'Proportional Donut', icon: PieChart },
  ];

  const aggregations: Array<{ fn: AggregationFunction; label: string }> = [
    { fn: 'sum', label: 'Sum' },
    { fn: 'mean', label: 'Average' },
    { fn: 'count', label: 'Count' },
    { fn: 'min', label: 'Min' },
    { fn: 'max', label: 'Max' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col space-y-4">
      {/* Widget Header & Quick Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <span>{config.title}</span>
            {config.isCumulative && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold">
                Cumulative
              </span>
            )}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {config.dimensionKey} • {config.metricKeys.join(', ')} ({config.aggregation.toUpperCase()})
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Quick Trendline Toggle (Line Charts) */}
          {config.chartType === 'line' && (
            <button
              type="button"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  showTrendline: prev.showTrendline === false ? true : false,
                }))
              }
              className={`px-2 py-1 rounded-lg text-xs font-medium border transition flex items-center space-x-1 ${
                config.showTrendline !== false
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                  : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Toggle average baseline & turning point badges"
            >
              <TrendingUp className="w-3 h-3" />
              <span className="hidden sm:inline">Trendline: {config.showTrendline !== false ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* Quick Chart Type Switcher */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
            {chartTypes.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setConfig((prev) => {
                    let newMetrics = prev.metricKeys;
                    if (type === 'stacked_bar' && newMetrics.length === 1 && numericColumns.length >= 2) {
                      const secondary = numericColumns.find((c) => c.name !== newMetrics[0])?.name;
                      if (secondary) newMetrics = [newMetrics[0], secondary];
                    }
                    return { ...prev, chartType: type, metricKeys: newMetrics };
                  })
                }
                className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
                  config.chartType === type
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
                title={label}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Toggle Interactive Tuning Drawer */}
          <button
            type="button"
            onClick={() => setShowControls(!showControls)}
            className={`p-1.5 rounded-lg border transition text-xs flex items-center space-x-1 ${
              showControls
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Tune dimensions, metrics and aggregations"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simplified Trend Summary Bar (for Line Charts) */}
      {config.chartType === 'line' && trendAnalysis && (
        <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                trendAnalysis.direction === 'up'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : trendAnalysis.direction === 'down'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {trendAnalysis.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : trendAnalysis.direction === 'down' ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              <span>
                {trendAnalysis.direction === 'up' ? '+' : ''}
                {trendAnalysis.overallChangePercent}% Overall
              </span>
            </span>

            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Avg: <strong className="text-slate-700 dark:text-slate-200 font-mono">{trendAnalysis.currencySymbol}{trendAnalysis.averageValue.toLocaleString()}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400">
            {trendAnalysis.peakCategory && (
              <span>
                Peak: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{trendAnalysis.peakCategory} ({trendAnalysis.currencySymbol}{trendAnalysis.peakValue.toLocaleString()})</strong>
              </span>
            )}
            {trendAnalysis.lowestCategory && (
              <span>
                Low: <strong className="text-rose-600 dark:text-rose-400 font-mono">{trendAnalysis.lowestCategory} ({trendAnalysis.currencySymbol}{trendAnalysis.lowestValue.toLocaleString()})</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expandable Controls Panel */}
      {showControls && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-slide-down">
          {/* Dimension Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dimension (X-Axis):
            </label>
            <select
              value={config.dimensionKey}
              onChange={(e) => setConfig((prev) => ({ ...prev, dimensionKey: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-hidden focus:border-indigo-500"
            >
              {categoricalOrDateColumns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.inferredType})
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Metric:
            </label>
            <select
              value={config.metricKeys[0] || ''}
              onChange={(e) => setConfig((prev) => ({ ...prev, metricKeys: [e.target.value] }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-hidden focus:border-indigo-500"
            >
              {numericColumns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation Function */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Aggregation:
            </label>
            <select
              value={config.aggregation}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, aggregation: e.target.value as AggregationFunction }))
              }
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-hidden focus:border-indigo-500"
            >
              {aggregations.map(({ fn, label }) => (
                <option key={fn} value={fn}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Toggles Column */}
          <div className="flex flex-col justify-end space-y-2">
            <button
              type="button"
              onClick={() => setConfig((prev) => ({ ...prev, isCumulative: !prev.isCumulative }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center space-x-1.5 ${
                config.isCumulative
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Sigma className="w-3.5 h-3.5" />
              <span>{config.isCumulative ? 'Cumulative: ON' : 'Cumulative: OFF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ECharts Canvas Container */}
      <div className="w-full h-72 sm:h-80">
        <ReactECharts
          option={echartsOption}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
          theme={isDarkMode ? 'dark' : undefined}
        />
      </div>
    </div>
  );
};

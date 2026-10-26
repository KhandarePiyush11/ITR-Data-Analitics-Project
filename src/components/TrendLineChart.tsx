/**
 * FinPulse Business Financial Analyzer
 * User-Friendly Dedicated Financial Trend Line Graph
 * 
 * @module components/TrendLineChart
 */

import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Layers, 
  Sigma, 
  SlidersHorizontal,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { UnifiedDataset, ColumnProfile, FinancialKpiSummary } from '../types';
import { cleanNumericValue, parseDateCandidate } from '../analyzer/typeInference';

interface TrendLineChartProps {
  dataset: UnifiedDataset;
  columnList: ColumnProfile[];
  kpis: FinancialKpiSummary;
  isDarkMode: boolean;
}

type MetricViewMode = 'all' | 'revenue' | 'expense' | 'profit';

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  dataset,
  columnList,
  kpis,
  isDarkMode,
}) => {
  const [viewMode, setViewMode] = useState<MetricViewMode>('all');
  const [isCumulative, setIsCumulative] = useState(false);
  const [showTrendMarkers, setShowTrendMarkers] = useState(true);

  const currencySymbol = kpis.currencySymbol || '$';

  // 1. Identify best Date dimension
  const dateDimension = useMemo(() => {
    if (kpis.dateColumn) return kpis.dateColumn;
    const dateCol = columnList.find((c) => c.inferredType === 'date');
    if (dateCol) return dateCol.name;
    const nameMatch = columnList.find((c) => /date|time|period|month|day|year/i.test(c.name));
    if (nameMatch) return nameMatch.name;
    const catCol = columnList.find((c) => c.inferredType === 'categorical');
    return catCol?.name || columnList[0]?.name || 'Period';
  }, [kpis, columnList]);

  // 2. Identify primary financial metric keys
  const metricConfig = useMemo(() => {
    const revCol = kpis.revenueColumn || columnList.find((c) => c.semanticRole === 'revenue')?.name;
    const expCol = kpis.expenseColumn || columnList.find((c) => c.semanticRole === 'expense')?.name;
    const pftCol = kpis.profitColumn || columnList.find((c) => c.semanticRole === 'profit')?.name;

    const availableNumerics = columnList
      .filter((c) => c.inferredType === 'numeric' || c.inferredType === 'currency')
      .map((c) => c.name);

    const revenue = revCol || availableNumerics[0] || 'Revenue';
    const expense = expCol || (availableNumerics[1] !== revenue ? availableNumerics[1] : undefined);
    const profit = pftCol || (availableNumerics[2] && availableNumerics[2] !== revenue && availableNumerics[2] !== expense ? availableNumerics[2] : undefined);

    return { revenue, expense, profit };
  }, [kpis, columnList]);

  // 3. Aggregate data points by date dimension chronologically
  const { categories, aggregatedRecords, trendSummary } = useMemo(() => {
    const { rows } = dataset;
    if (!rows || rows.length === 0) {
      return { categories: [], aggregatedRecords: [], trendSummary: null };
    }

    const groupMap = new Map<string, { rev: number; exp: number; pft: number; dateObj?: Date }>();

    const typeCol = kpis.typeColumn || columnList.find((c) => /^(type|txn_type|flow|flow_type|entry_type|cr_dr|dr_cr|d_c)$/i.test(c.name))?.name;

    rows.forEach((r) => {
      let rawDate = r[dateDimension];
      let formattedKey = '(Blank)';
      let dateObj: Date | undefined;

      const candidate = parseDateCandidate(rawDate);
      if (candidate) {
        dateObj = candidate;
        const monthName = candidate.toLocaleString('en-US', { month: 'short' });
        formattedKey = `${monthName} ${candidate.getFullYear()}`;
      } else if (rawDate !== undefined && rawDate !== null && String(rawDate).trim() !== '') {
        formattedKey = String(rawDate).trim();
      }

      if (!groupMap.has(formattedKey)) {
        groupMap.set(formattedKey, { rev: 0, exp: 0, pft: 0, dateObj });
      }

      const item = groupMap.get(formattedKey)!;
      let revVal = 0;
      let expVal = 0;

      if (metricConfig.revenue && metricConfig.expense && metricConfig.revenue !== metricConfig.expense) {
        revVal = cleanNumericValue(r[metricConfig.revenue]) || 0;
        expVal = Math.abs(cleanNumericValue(r[metricConfig.expense]) || 0);
      } else if (metricConfig.revenue) {
        const rawVal = cleanNumericValue(r[metricConfig.revenue]) || 0;
        const typeVal = typeCol ? String(r[typeCol] || '').toLowerCase().trim() : '';

        if (typeVal) {
          if (/exp|deb|cost|pay|out|withdr|fee|charge|bill/i.test(typeVal)) {
            expVal = Math.abs(rawVal);
          } else if (/inc|rev|cred|dep|sale|earn|inflow/i.test(typeVal)) {
            revVal = Math.abs(rawVal);
          } else if (rawVal < 0) {
            expVal = Math.abs(rawVal);
          } else {
            revVal = rawVal;
          }
        } else {
          if (rawVal < 0) {
            expVal = Math.abs(rawVal);
          } else {
            revVal = rawVal;
          }
        }
      } else if (metricConfig.expense) {
        expVal = Math.abs(cleanNumericValue(r[metricConfig.expense]) || 0);
      }

      const pftVal = metricConfig.profit && r[metricConfig.profit] !== undefined
        ? cleanNumericValue(r[metricConfig.profit]) || (revVal - expVal)
        : (revVal - expVal);

      item.rev += revVal;
      item.exp += expVal;
      item.pft += pftVal;
    });

    // Sort chronologically if date objects exist, else alphabetically
    const sorted = Array.from(groupMap.entries()).sort((a, b) => {
      if (a[1].dateObj && b[1].dateObj) {
        return a[1].dateObj.getTime() - b[1].dateObj.getTime();
      }
      return a[0].localeCompare(b[0]);
    });

    const catList = sorted.map(([k]) => k);
    const records: Array<{ period: string; revenue: number; expense: number; profit: number }> = [];

    let cumRev = 0;
    let cumExp = 0;
    let cumPft = 0;

    sorted.forEach(([k, vals]) => {
      if (isCumulative) {
        cumRev += vals.rev;
        cumExp += vals.exp;
        cumPft += vals.pft;
        records.push({
          period: k,
          revenue: Math.round(cumRev * 100) / 100,
          expense: Math.round(cumExp * 100) / 100,
          profit: Math.round(cumPft * 100) / 100,
        });
      } else {
        records.push({
          period: k,
          revenue: Math.round(vals.rev * 100) / 100,
          expense: Math.round(vals.exp * 100) / 100,
          profit: Math.round(vals.pft * 100) / 100,
        });
      }
    });

    // Compute executive trend metrics for primary focus
    let peakPeriod = '';
    let peakValue = -Infinity;
    let lowPeriod = '';
    let lowValue = Infinity;
    let totalPrimary = 0;

    records.forEach((rec) => {
      const val = viewMode === 'expense' ? rec.expense : viewMode === 'profit' ? rec.profit : rec.revenue;
      totalPrimary += val;
      if (val > peakValue) {
        peakValue = val;
        peakPeriod = rec.period;
      }
      if (val < lowValue) {
        lowValue = val;
        lowPeriod = rec.period;
      }
    });

    const startVal = records[0] 
      ? (viewMode === 'expense' ? records[0].expense : viewMode === 'profit' ? records[0].profit : records[0].revenue)
      : 0;
    const endVal = records[records.length - 1]
      ? (viewMode === 'expense' ? records[records.length - 1].expense : viewMode === 'profit' ? records[records.length - 1].profit : records[records.length - 1].revenue)
      : 0;

    const overallPct = startVal !== 0 
      ? Math.round(((endVal - startVal) / Math.abs(startVal)) * 1000) / 10 
      : 0;

    const avgVal = records.length > 0 ? Math.round(totalPrimary / records.length) : 0;

    const summary = {
      overallPct,
      direction: overallPct > 0.5 ? 'up' : overallPct < -0.5 ? 'down' : 'flat',
      peakPeriod,
      peakValue: peakValue === -Infinity ? 0 : peakValue,
      lowPeriod,
      lowValue: lowValue === Infinity ? 0 : lowValue,
      avgVal,
    };

    return { categories: catList, aggregatedRecords: records, trendSummary: summary };
  }, [dataset, dateDimension, metricConfig, isCumulative, viewMode]);

  // 4. Assemble User-Friendly ECharts Options
  const echartsOption = useMemo(() => {
    if (categories.length === 0) return {};

    const textColor = isDarkMode ? '#94a3b8' : '#64748b';
    const splitLineColor = isDarkMode ? 'rgba(51, 65, 85, 0.35)' : 'rgba(241, 245, 249, 0.9)';
    const tooltipBg = isDarkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';

    // Helper for compact Y-axis labels
    const formatCompact = (val: number) => {
      if (val === null || val === undefined || isNaN(val)) return `${currencySymbol}0`;
      const isNeg = val < 0;
      const absVal = Math.abs(val);
      let text = '';
      if (absVal >= 1_000_000_000) text = `${(absVal / 1_000_000_000).toFixed(1)}B`;
      else if (absVal >= 1_000_000) text = `${(absVal / 1_000_000).toFixed(1)}M`;
      else if (absVal >= 1_000) text = `${(absVal / 1_000).toFixed(1)}k`;
      else text = absVal.toFixed(0);
      text = text.replace(/\.0([BMk])/, '$1');
      return `${isNeg ? '-' : ''}${currencySymbol}${text}`;
    };

    // Determine which series to show based on viewMode
    const seriesConfigs: Array<{
      key: 'revenue' | 'expense' | 'profit';
      name: string;
      color: string;
      visible: boolean;
      isPrimary: boolean;
    }> = [
      {
        key: 'revenue',
        name: metricConfig.revenue || 'Revenue',
        color: '#6366f1', // Indigo
        visible: viewMode === 'all' || viewMode === 'revenue',
        isPrimary: viewMode === 'revenue' || viewMode === 'all',
      },
      {
        key: 'expense',
        name: metricConfig.expense || 'Operating Expenses',
        color: '#f43f5e', // Rose
        visible: viewMode === 'all' || viewMode === 'expense',
        isPrimary: viewMode === 'expense',
      },
      {
        key: 'profit',
        name: metricConfig.profit || 'Net Profit',
        color: '#10b981', // Emerald
        visible: viewMode === 'all' || viewMode === 'profit',
        isPrimary: viewMode === 'profit',
      },
    ];

    const activeSeriesList = seriesConfigs
      .filter((s) => s.visible)
      .map((s) => {
        // Peak & Low pins for the primary series when trend markers are active
        const markPoint = showTrendMarkers && s.isPrimary && aggregatedRecords.length >= 3
          ? {
              symbol: 'pin',
              symbolSize: 34,
              animationDuration: 600,
              data: [
                {
                  type: 'max',
                  name: 'Peak',
                  itemStyle: { color: '#10b981' },
                  label: { fontSize: 9, fontWeight: 700, color: '#ffffff', formatter: 'Peak' },
                },
                {
                  type: 'min',
                  name: 'Low',
                  itemStyle: { color: '#f43f5e' },
                  label: { fontSize: 9, fontWeight: 700, color: '#ffffff', formatter: 'Low' },
                },
              ],
            }
          : undefined;

        // Dashed baseline showing the average for the primary series
        const markLine = showTrendMarkers && s.isPrimary && aggregatedRecords.length >= 2
          ? {
              symbol: ['none', 'none'],
              silent: false,
              animationDuration: 800,
              lineStyle: {
                type: 'dashed',
                color: isDarkMode ? '#94a3b8' : '#64748b',
                width: 1.5,
              },
              label: {
                show: true,
                position: 'insideEndTop',
                formatter: (p: any) => `Avg: ${formatCompact(p.value)}`,
                color: isDarkMode ? '#cbd5e1' : '#475569',
                fontSize: 10,
                fontWeight: 600,
                backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                padding: [2, 6],
                borderRadius: 4,
              },
              data: [{ type: 'average', name: 'Average' }],
            }
          : undefined;

        return {
          name: s.name,
          type: 'line',
          smooth: 0.25, // Gentle clean curve
          showSymbol: true,
          symbol: 'circle',
          symbolSize: s.isPrimary ? 7 : 5,
          lineStyle: {
            width: s.isPrimary ? 3 : 2.2,
            color: s.color,
          },
          itemStyle: {
            color: s.color,
            borderColor: isDarkMode ? '#0f172a' : '#ffffff',
            borderWidth: 2,
          },
          emphasis: {
            focus: 'series',
            scale: 1.35,
          },
          // Soft transparent gradient under the primary line for effortless trend tracing
          areaStyle: s.isPrimary
            ? {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: `${s.color}22` }, // Very subtle 13% tint
                    { offset: 1, color: `${s.color}00` }, // Fades out
                  ],
                },
              }
            : undefined,
          markPoint,
          markLine,
          data: aggregatedRecords.map((r) => r[s.key]),
        };
      });

    const hasManyPeriods = categories.length > 12;

    return {
      animationDuration: 750,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'axis',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: [12, 16],
        shadowColor: 'rgba(0,0,0,0.18)',
        shadowBlur: 14,
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: isDarkMode ? '#64748b' : '#cbd5e1',
            type: 'dashed',
            width: 1.5,
          },
        },
        formatter: (params: any[]) => {
          if (!params || params.length === 0) return '';
          const idx = params[0].dataIndex;
          const periodTitle = params[0].axisValue;

          let html = `<div style="font-weight:700; font-size:12px; margin-bottom:8px; color:${isDarkMode ? '#f8fafc' : '#0f172a'}; border-bottom: 1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}; padding-bottom:4px;">${periodTitle}</div>`;

          params.forEach((item) => {
            const val = item.value;
            const seriesName = item.seriesName;
            const color = item.color;
            const formattedVal = `${currencySymbol}${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            let trendBadge = '';
            if (idx > 0) {
              const prevRec = aggregatedRecords[idx - 1];
              // Map series back to property
              let prevVal: number | undefined;
              if (seriesName === metricConfig.revenue || seriesName === 'Revenue') {
                prevVal = prevRec?.revenue;
              } else if (seriesName === metricConfig.expense || seriesName === 'Operating Expenses') {
                prevVal = prevRec?.expense;
              } else {
                prevVal = prevRec?.profit;
              }

              if (typeof prevVal === 'number' && prevVal !== 0) {
                const pct = ((val - prevVal) / Math.abs(prevVal)) * 100;
                const isPos = pct >= 0;
                const badgeBg = isPos
                  ? (isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7')
                  : (isDarkMode ? 'rgba(244, 63, 94, 0.2)' : '#fee2e2');
                const badgeColor = isPos ? '#10b981' : '#f43f5e';
                trendBadge = `<span style="font-size:10px; font-weight:700; padding:1px 6px; border-radius:4px; margin-left:8px; background:${badgeBg}; color:${badgeColor};">${isPos ? '▲ +' : '▼ '}${pct.toFixed(1)}%</span>`;
              }
            } else {
              trendBadge = `<span style="font-size:10px; color:${textColor}; margin-left:8px;">(Start)</span>`;
            }

            html += `
              <div style="display:flex; justify-content:space-between; align-items:center; margin:6px 0; font-size:12px;">
                <span style="display:flex; align-items:center; color:${isDarkMode ? '#cbd5e1' : '#475569'}; margin-right:16px;">
                  <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${color}; margin-right:6px;"></span>
                  ${seriesName}
                </span>
                <span style="display:flex; align-items:center;">
                  <span style="font-weight:700; font-family:monospace; color:${isDarkMode ? '#f8fafc' : '#0f172a'};">${formattedVal}</span>
                  ${trendBadge}
                </span>
              </div>
            `;
          });

          return html;
        },
      },
      legend: {
        top: '2%',
        right: '4%',
        textStyle: { color: textColor, fontSize: 11 },
        icon: 'circle',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: hasManyPeriods ? '14%' : '8%',
        top: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: splitLineColor } },
        axisLabel: {
          color: textColor,
          rotate: categories.length > 8 ? 25 : 0,
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: textColor,
          formatter: formatCompact,
          fontSize: 11,
        },
        splitLine: { lineStyle: { color: splitLineColor } },
      },
      dataZoom: hasManyPeriods
        ? [
            {
              type: 'inside',
              start: Math.max(0, 100 - Math.round((12 / categories.length) * 100)),
              end: 100,
            },
            {
              type: 'slider',
              show: true,
              height: 14,
              bottom: 2,
              borderColor: 'transparent',
              backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
              fillerColor: isDarkMode ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.15)',
              handleStyle: { color: '#6366f1', borderColor: '#6366f1' },
              textStyle: { color: textColor, fontSize: 10 },
              start: Math.max(0, 100 - Math.round((12 / categories.length) * 100)),
              end: 100,
            },
          ]
        : undefined,
      series: activeSeriesList,
    };
  }, [categories, aggregatedRecords, viewMode, showTrendMarkers, isDarkMode, currencySymbol, metricConfig]);

  if (categories.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header with Title and Mode Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Financial Trend & Trajectory</span>
            {isCumulative && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold">
                Cumulative
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Timeline trajectory over {categories.length} periods ({dateDimension})
          </p>
        </div>

        {/* Quick Metric View Switcher */}
        <div className="flex items-center space-x-2 flex-wrap">
          <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              All Metrics
            </button>
            <button
              type="button"
              onClick={() => setViewMode('revenue')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                viewMode === 'revenue'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Revenue
            </button>
            <button
              type="button"
              onClick={() => setViewMode('expense')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                viewMode === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => setViewMode('profit')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                viewMode === 'profit'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Net Profit
            </button>
          </div>

          {/* Trend Markers Toggle */}
          <button
            type="button"
            onClick={() => setShowTrendMarkers(!showTrendMarkers)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition flex items-center space-x-1 ${
              showTrendMarkers
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle average baseline & peak/low markers"
          >
            <TrendingUp className="w-3 h-3" />
            <span className="hidden sm:inline">Baseline: {showTrendMarkers ? 'ON' : 'OFF'}</span>
          </button>

          {/* Cumulative Toggle */}
          <button
            type="button"
            onClick={() => setIsCumulative(!isCumulative)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition flex items-center space-x-1 ${
              isCumulative
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle cumulative running totals"
          >
            <Sigma className="w-3 h-3" />
            <span className="hidden sm:inline">Cumulative</span>
          </button>
        </div>
      </div>

      {/* Trend Insights Summary Strip */}
      {trendSummary && (
        <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                trendSummary.direction === 'up'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : trendSummary.direction === 'down'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {trendSummary.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : trendSummary.direction === 'down' ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              <span>
                {trendSummary.direction === 'up' ? '+' : ''}
                {trendSummary.overallPct}% Overall
              </span>
            </span>

            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Avg: <strong className="text-slate-700 dark:text-slate-200 font-mono">{currencySymbol}{trendSummary.avgVal.toLocaleString()}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400">
            {trendSummary.peakPeriod && (
              <span>
                Peak: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{trendSummary.peakPeriod} ({currencySymbol}{trendSummary.peakValue.toLocaleString()})</strong>
              </span>
            )}
            {trendSummary.lowPeriod && (
              <span>
                Low: <strong className="text-rose-600 dark:text-rose-400 font-mono">{trendSummary.lowPeriod} ({currencySymbol}{trendSummary.lowValue.toLocaleString()})</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main ECharts Canvas */}
      <div className="w-full h-80 sm:h-96">
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

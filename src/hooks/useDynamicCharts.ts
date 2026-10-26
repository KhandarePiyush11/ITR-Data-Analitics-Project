/**
 * FinPulse Business Financial Analyzer
 * Adaptive ECharts Configuration & Dynamic Aggregation Hook
 * 
 * @module hooks/useDynamicCharts
 * @author Senior Data Architect & Principal Engineer
 */

import { useMemo } from 'react';
import { 
  UnifiedDataset, 
  ActiveChartConfig, 
  AggregationFunction 
} from '../types';
import { cleanNumericValue, parseDateCandidate, extractCurrencySymbol } from '../analyzer/typeInference';

export interface TrendAnalysisSummary {
  overallChangePercent: number;
  direction: 'up' | 'down' | 'flat';
  peakCategory: string;
  peakValue: number;
  lowestCategory: string;
  lowestValue: number;
  averageValue: number;
  currencySymbol: string;
}

export interface DynamicChartResult {
  echartsOption: Record<string, any>;
  aggregatedData: Array<Record<string, any>>;
  categories: string[];
  trendAnalysis?: TrendAnalysisSummary;
}

/** Professional color palettes tailored for enterprise analytics */
const CHART_PALETTE = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#f43f5e', // Rose
  '#3b82f6', // Blue
];

/**
 * Compact numeric/currency formatter for axes (e.g. $12.5k, $1.2M)
 */
function formatCompactValue(value: number, symbol = ''): string {
  if (value === null || value === undefined || isNaN(value)) return `${symbol}0`;
  const isNegative = value < 0;
  const absVal = Math.abs(value);

  let formatted = '';
  if (absVal >= 1_000_000_000) {
    formatted = `${(absVal / 1_000_000_000).toFixed(1)}B`;
  } else if (absVal >= 1_000_000) {
    formatted = `${(absVal / 1_000_000).toFixed(1)}M`;
  } else if (absVal >= 1_000) {
    formatted = `${(absVal / 1_000).toFixed(1)}k`;
  } else {
    formatted = absVal.toLocaleString('en-US', { maximumFractionDigits: 1 });
  }

  formatted = formatted.replace(/\.0([BMk])/, '$1');
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Standard number/currency formatter with commas
 */
function formatCleanValue(value: number, symbol = '', decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return `${symbol}0.00`;
  const isNegative = value < 0;
  const absVal = Math.abs(value);
  const formatted = absVal.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Normalizes date values into consistent bucket strings
 */
function formatDateBucket(date: Date, granularity: 'day' | 'month' | 'quarter' | 'year' = 'month'): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const monthName = date.toLocaleString('en-US', { month: 'short' });
  const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;

  switch (granularity) {
    case 'day':
      return `${yyyy}-${mm}-${dd}`;
    case 'quarter':
      return `${yyyy} ${quarter}`;
    case 'year':
      return `${yyyy}`;
    case 'month':
    default:
      return `${monthName} ${yyyy}`;
  }
}

/**
 * Custom React Hook to compute dynamic aggregations and return ready-to-render ECharts options
 * 
 * @param dataset The active UnifiedDataset
 * @param config Current chart configuration
 * @param isDarkMode Whether dark mode is currently active
 * @returns DynamicChartResult
 */
export function useDynamicCharts(
  dataset: UnifiedDataset | null,
  config: ActiveChartConfig,
  isDarkMode = false
): DynamicChartResult {
  return useMemo(() => {
    if (!dataset || !dataset.rows || dataset.rows.length === 0) {
      return { echartsOption: {}, aggregatedData: [], categories: [] };
    }

    const { rows } = dataset;
    const { 
      dimensionKey, 
      metricKeys, 
      aggregation, 
      chartType, 
      dateGranularity, 
      isCumulative,
      showTrendline = true 
    } = config;

    // Detect currency symbol from dataset if available
    let detectedCurrency = '';
    for (const r of rows.slice(0, 15)) {
      for (const k of metricKeys) {
        const sym = extractCurrencySymbol(r[k]);
        if (sym) {
          detectedCurrency = sym;
          break;
        }
      }
      if (detectedCurrency) break;
    }
    if (!detectedCurrency) detectedCurrency = '$';

    // 1. Group rows by dimension
    const groupMap = new Map<string, { rawValues: Record<string, number[]>; dateObj?: Date }>();

    rows.forEach((row) => {
      let dimVal = row[dimensionKey];
      let dateObj: Date | undefined;

      // If dimension is a date candidate, format according to granularity
      const candidateDate = parseDateCandidate(dimVal);
      if (candidateDate) {
        dimVal = formatDateBucket(candidateDate, dateGranularity || 'month');
        dateObj = candidateDate;
      } else {
        dimVal = dimVal !== undefined && dimVal !== null && String(dimVal).trim() !== ''
          ? String(dimVal).trim()
          : '(Blank)';
      }

      if (!groupMap.has(dimVal)) {
        const initialRaw: Record<string, number[]> = {};
        metricKeys.forEach((k) => (initialRaw[k] = []));
        groupMap.set(dimVal, { rawValues: initialRaw, dateObj });
      }

      const groupEntry = groupMap.get(dimVal)!;
      metricKeys.forEach((k) => {
        const num = cleanNumericValue(row[k]);
        if (!isNaN(num)) {
          groupEntry.rawValues[k].push(num);
        }
      });
    });

    // 2. Aggregate values for each group
    const aggregate = (numbers: number[], fn: AggregationFunction): number => {
      if (numbers.length === 0) return 0;
      switch (fn) {
        case 'mean':
          return numbers.reduce((a, b) => a + b, 0) / numbers.length;
        case 'count':
          return numbers.length;
        case 'min':
          return Math.min(...numbers);
        case 'max':
          return Math.max(...numbers);
        case 'sum':
        default:
          return numbers.reduce((a, b) => a + b, 0);
      }
    };

    // Sort categories chronologically if date, or alphabetically
    const sortedEntries = Array.from(groupMap.entries()).sort((a, b) => {
      if (a[1].dateObj && b[1].dateObj) {
        return a[1].dateObj.getTime() - b[1].dateObj.getTime();
      }
      return a[0].localeCompare(b[0]);
    });

    const categories = sortedEntries.map(([cat]) => cat);
    const aggregatedData: Array<Record<string, any>> = [];

    // Track cumulative values across series if requested
    const cumulativeTotals: Record<string, number> = {};
    metricKeys.forEach((k) => (cumulativeTotals[k] = 0));

    sortedEntries.forEach(([cat, { rawValues }]) => {
      const record: Record<string, any> = { [dimensionKey]: cat };
      metricKeys.forEach((k) => {
        const val = aggregate(rawValues[k] || [], aggregation);
        if (isCumulative) {
          cumulativeTotals[k] += val;
          record[k] = Math.round(cumulativeTotals[k] * 100) / 100;
        } else {
          record[k] = Math.round(val * 100) / 100;
        }
      });
      aggregatedData.push(record);
    });

    // Compute Trend Analysis Summary for Primary Metric
    let trendAnalysis: TrendAnalysisSummary | undefined = undefined;
    const primaryMetric = metricKeys[0];

    if (aggregatedData.length > 0 && primaryMetric) {
      const primaryValues = aggregatedData.map((d) => d[primaryMetric] ?? 0);
      const startVal = primaryValues[0] ?? 0;
      const endVal = primaryValues[primaryValues.length - 1] ?? 0;
      const total = primaryValues.reduce((a, b) => a + b, 0);
      const avg = primaryValues.length > 0 ? total / primaryValues.length : 0;

      let peakVal = -Infinity;
      let peakCat = '';
      let lowVal = Infinity;
      let lowCat = '';

      aggregatedData.forEach((d) => {
        const val = d[primaryMetric];
        if (typeof val === 'number') {
          if (val > peakVal) {
            peakVal = val;
            peakCat = d[dimensionKey];
          }
          if (val < lowVal) {
            lowVal = val;
            lowCat = d[dimensionKey];
          }
        }
      });

      const changePct = startVal !== 0 
        ? Math.round(((endVal - startVal) / Math.abs(startVal)) * 1000) / 10 
        : 0;

      const direction: 'up' | 'down' | 'flat' = changePct > 0.5 ? 'up' : changePct < -0.5 ? 'down' : 'flat';

      trendAnalysis = {
        overallChangePercent: changePct,
        direction,
        peakCategory: peakCat,
        peakValue: peakVal === -Infinity ? 0 : peakVal,
        lowestCategory: lowCat,
        lowestValue: lowVal === Infinity ? 0 : lowVal,
        averageValue: Math.round(avg * 100) / 100,
        currencySymbol: detectedCurrency,
      };
    }

    // 3. Assemble Theme-Aware ECharts Configuration
    const textColor = isDarkMode ? '#94a3b8' : '#64748b';
    const splitLineColor = isDarkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(241, 245, 249, 0.9)';
    const tooltipBg = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)';
    const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';

    const baseTooltip = {
      trigger: chartType === 'pie' || chartType === 'donut' ? 'item' : 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: { color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: 12 },
      shadowColor: 'rgba(0,0,0,0.15)',
      shadowBlur: 10,
    };

    // Branch chart type configuration
    let option: Record<string, any> = {};

    if (chartType === 'donut' || chartType === 'pie') {
      const metricKey = metricKeys[0];
      const sortedData = [...aggregatedData]
        .map((d) => ({
          name: String(d[dimensionKey] || 'Unspecified'),
          value: Math.max(0, Math.abs(d[metricKey] || 0)),
        }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value);

      let pieData = sortedData;
      if (sortedData.length > 8) {
        const top = sortedData.slice(0, 7);
        const otherSum = sortedData.slice(7).reduce((acc, curr) => acc + curr.value, 0);
        pieData = [...top, { name: 'Other Categories', value: Math.round(otherSum * 100) / 100 }];
      }

      option = {
        color: CHART_PALETTE,
        tooltip: baseTooltip,
        legend: {
          bottom: '2%',
          left: 'center',
          textStyle: { color: textColor },
          icon: 'circle',
        },
        series: [
          {
            name: metricKey,
            type: 'pie',
            radius: chartType === 'donut' ? ['45%', '70%'] : '65%',
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: chartType === 'donut' ? 6 : 0,
              borderColor: isDarkMode ? '#0f172a' : '#ffffff',
              borderWidth: 2,
            },
            label: {
              show: true,
              formatter: '{b}: {d}%',
              color: textColor,
            },
            data: pieData,
          },
        ],
      };
    } else if (chartType === 'scatter') {
      const metricX = dimensionKey;
      const metricY = metricKeys[0];

      const scatterData = rows.map((r) => [
        cleanNumericValue(r[metricX]) || 0,
        cleanNumericValue(r[metricY]) || 0,
      ]);

      option = {
        color: [CHART_PALETTE[0]],
        tooltip: {
          ...baseTooltip,
          trigger: 'item',
          formatter: (params: any) =>
            `${metricX}: ${params.value[0].toLocaleString()}<br/>${metricY}: ${params.value[1].toLocaleString()}`,
        },
        xAxis: {
          name: metricX,
          nameTextStyle: { color: textColor },
          axisLabel: { color: textColor },
          splitLine: { lineStyle: { color: splitLineColor } },
        },
        yAxis: {
          name: metricY,
          nameTextStyle: { color: textColor },
          axisLabel: { color: textColor },
          splitLine: { lineStyle: { color: splitLineColor } },
        },
        series: [
          {
            type: 'scatter',
            symbolSize: 8,
            data: scatterData,
          },
        ],
      };
    } else {
      // Line, Area, Bar, Stacked Bar
      const isLine = chartType === 'line';
      const isArea = chartType === 'area';
      const isBar = chartType === 'bar' || chartType === 'stacked_bar';

      const seriesList = metricKeys.map((k, idx) => {
        const color = CHART_PALETTE[idx % CHART_PALETTE.length];
        const isPrimary = idx === 0;

        // Peak and Lowest indicators on the primary trendline for rapid comprehension
        const markPoint = (isLine && isPrimary && showTrendline && aggregatedData.length >= 3)
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

        // Average baseline reference on the primary series
        const markLine = (isLine && isPrimary && showTrendline && aggregatedData.length >= 2)
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
                formatter: (params: any) => `Avg: ${formatCompactValue(params.value, detectedCurrency)}`,
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
          name: k,
          type: isBar ? 'bar' : 'line',
          stack: chartType === 'stacked_bar' ? 'total' : undefined,
          smooth: 0.25, // Subtle smooth curve avoiding extreme overshoot
          showSymbol: isLine,
          symbol: 'circle',
          symbolSize: isLine ? 6 : 4,
          lineStyle: {
            width: isLine ? (isPrimary ? 3 : 2.2) : 2,
            color,
          },
          barMaxWidth: 35,
          itemStyle: {
            borderRadius: isBar ? [4, 4, 0, 0] : 0,
            color,
            borderColor: isDarkMode ? '#0f172a' : '#ffffff',
            borderWidth: isLine ? 2 : 0,
          },
          emphasis: {
            focus: 'series',
            scale: isLine ? 1.4 : 1,
          },
          areaStyle: (isArea || (isLine && isPrimary))
            ? {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: isLine
                    ? [
                        { offset: 0, color: `${color}20` }, // Very gentle tint for simple visual guidance
                        { offset: 1, color: `${color}00` },
                      ]
                    : [
                        { offset: 0, color: `${color}60` },
                        { offset: 1, color: `${color}05` },
                      ],
                },
              }
            : undefined,
          markPoint,
          markLine,
          data: aggregatedData.map((d) => d[k]),
        };
      });

      // Clear & intuitive interactive trend tooltip with period-over-period percentage shifts
      const interactiveTooltip = isLine
        ? {
            trigger: 'axis',
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            borderWidth: 1,
            padding: [10, 14],
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
              const catIndex = params[0].dataIndex;
              const catName = params[0].axisValue;
              
              let html = `<div style="font-weight:700; font-size:12px; margin-bottom:8px; color:${isDarkMode ? '#f8fafc' : '#0f172a'}; border-bottom: 1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}; padding-bottom:4px;">${catName}</div>`;

              params.forEach((item) => {
                const val = item.value;
                const seriesName = item.seriesName;
                const color = item.color;
                const formattedVal = formatCleanValue(val, detectedCurrency);

                // Calculate period-over-period trend delta
                let trendBadge = '';
                if (catIndex > 0) {
                  const prevRecord = aggregatedData[catIndex - 1];
                  const prevVal = prevRecord ? prevRecord[seriesName] : undefined;
                  if (typeof prevVal === 'number' && !isNaN(prevVal)) {
                    if (prevVal === 0) {
                      trendBadge = `<span style="font-size:10px; color:${isDarkMode ? '#94a3b8' : '#64748b'}; margin-left:6px;">—</span>`;
                    } else {
                      const pct = ((val - prevVal) / Math.abs(prevVal)) * 100;
                      const isPositive = pct >= 0;
                      const badgeBg = isPositive 
                        ? (isDarkMode ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7') 
                        : (isDarkMode ? 'rgba(244, 63, 94, 0.2)' : '#fee2e2');
                      const badgeText = isPositive ? '#10b981' : '#f43f5e';
                      trendBadge = `<span style="display:inline-flex; align-items:center; font-size:10px; font-weight:600; padding:1px 5px; border-radius:4px; margin-left:6px; background:${badgeBg}; color:${badgeText};">${isPositive ? '▲ +' : '▼ '}${pct.toFixed(1)}%</span>`;
                    }
                  }
                } else {
                  trendBadge = `<span style="font-size:10px; color:${isDarkMode ? '#94a3b8' : '#64748b'}; margin-left:6px; font-weight:500;">(Start)</span>`;
                }

                html += `
                  <div style="display:flex; justify-content:space-between; align-items:center; margin:5px 0; font-size:12px;">
                    <span style="display:flex; align-items:center; color:${isDarkMode ? '#cbd5e1' : '#475569'}; margin-right:12px;">
                      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${color}; margin-right:6px;"></span>
                      ${seriesName}
                    </span>
                    <span style="display:flex; align-items:center;">
                      <span style="font-weight:600; font-family:monospace; color:${isDarkMode ? '#f8fafc' : '#0f172a'};">${formattedVal}</span>
                      ${trendBadge}
                    </span>
                  </div>
                `;
              });

              return html;
            },
          }
        : baseTooltip;

      // Smart horizontal zoom when dealing with lengthy timeline points
      const hasLongTimeline = categories.length > 14;

      option = {
        color: CHART_PALETTE,
        tooltip: interactiveTooltip,
        legend: {
          top: '2%',
          textStyle: { color: textColor },
          icon: 'circle',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: hasLongTimeline ? '14%' : '8%',
          top: '12%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisLine: { lineStyle: { color: splitLineColor } },
          axisLabel: { color: textColor, rotate: categories.length > 8 ? 25 : 0 },
        },
        yAxis: {
          type: 'value',
          axisLabel: { 
            color: textColor,
            formatter: (v: number) => formatCompactValue(v, detectedCurrency),
          },
          splitLine: { lineStyle: { color: splitLineColor } },
        },
        dataZoom: hasLongTimeline
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
        series: seriesList,
      };
    }

    return {
      echartsOption: option,
      aggregatedData,
      categories,
      trendAnalysis,
    };
  }, [dataset, config, isDarkMode]);
}

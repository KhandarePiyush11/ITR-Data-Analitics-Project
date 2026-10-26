import * as echarts from 'echarts';
import { formatCompactCurrency, formatCurrency, formatPercentage } from './formatters';

/**
 * Modern curated color palette for Apache ECharts
 */
export const ECHARTS_PALETTE = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#3b82f6', // Blue
  '#84cc16', // Lime
];

/**
 * Return theme configuration based on darkMode state
 */
export function getChartTheme(darkMode = false) {
  return {
    isDark: darkMode,
    textColor: darkMode ? '#cbd5e1' : '#475569',
    mutedText: darkMode ? '#64748b' : '#94a3b8',
    borderColor: darkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)',
    splitLineColor: darkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(241, 245, 249, 0.9)',
    tooltipBg: darkMode ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.96)',
    tooltipBorder: darkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 0.9)',
    cardBg: darkMode ? '#0f172a' : '#ffffff',
  };
}

/**
 * 1. EXECUTIVE P&L OVERVIEW (Combo Bar + Line + Zoom + Toolbox)
 */
export function getOverviewOption(chartData, currencySymbol = '$', darkMode = false) {
  const theme = getChartTheme(darkMode);
  const periods = chartData.map((d) => d.period);
  const revenues = chartData.map((d) => d.revenue);
  const expenses = chartData.map((d) => d.expense);
  const profits = chartData.map((d) => d.profit);

  return {
    backgroundColor: 'transparent',
    color: ECHARTS_PALETTE,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: theme.textColor, fontSize: 12 },
      extraCssText: 'box-shadow: 0 12px 24px -4px rgba(0,0,0,0.25); border-radius: 12px; backdrop-filter: blur(8px);',
      axisPointer: {
        type: 'cross',
        crossStyle: { color: theme.mutedText },
        lineStyle: { color: darkMode ? '#475569' : '#cbd5e1', type: 'dashed' },
      },
      formatter: (params) => {
        if (!params || params.length === 0) return '';
        const title = params[0].axisValue;
        let html = `<div style="font-weight: 700; margin-bottom: 8px; color: ${darkMode ? '#f8fafc' : '#0f172a'}; border-bottom: 1px solid ${theme.borderColor}; padding-bottom: 4px;">${title}</div>`;
        
        let rev = 0;
        let exp = 0;
        let pft = 0;

        params.forEach((item) => {
          const val = item.value;
          const color = item.color?.colorStops ? item.color.colorStops[0].color : item.color;
          let valFormatted = formatCurrency(val, currencySymbol);

          if (item.seriesName === 'Net Profit') {
            pft = val;
            const badgeBg = val >= 0 ? (darkMode ? '#064e3b' : '#dcfce7') : (darkMode ? '#7f1d1d' : '#fee2e2');
            const badgeColor = val >= 0 ? '#10b981' : '#f43f5e';
            html += `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding: 4px 8px; background: ${badgeBg}; border-radius: 6px;">
                <span style="font-weight: 600; color: ${badgeColor}; display: flex; align-items: center;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${badgeColor}; margin-right: 6px;"></span>
                  ${item.seriesName}:
                </span>
                <span style="font-weight: 700; font-family: monospace; color: ${badgeColor};">${valFormatted}</span>
              </div>
            `;
          } else {
            if (item.seriesName === 'Revenue') rev = val;
            if (item.seriesName === 'Expenses') exp = val;
            html += `
              <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
                <span style="color: ${theme.mutedText}; display: flex; align-items: center;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 2px; background: ${color}; margin-right: 6px;"></span>
                  ${item.seriesName}:
                </span>
                <span style="font-weight: 600; font-family: monospace; margin-left: 16px; color: ${darkMode ? '#f1f5f9' : '#1e293b'};">${valFormatted}</span>
              </div>
            `;
          }
        });

        if (rev > 0) {
          const margin = (pft / rev) * 100;
          html += `
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed ${theme.borderColor}; display: flex; justify-content: space-between; font-size: 11px; color: ${theme.mutedText};">
              <span>Profit Margin:</span>
              <span style="font-weight: 700; font-family: monospace; color: ${margin >= 0 ? '#10b981' : '#f43f5e'};">${formatPercentage(margin, true, 1)}</span>
            </div>
          `;
        }

        return html;
      },
    },
    legend: {
      data: ['Revenue', 'Expenses', 'Net Profit'],
      top: 0,
      right: 120,
      textStyle: { color: theme.textColor, fontSize: 12, fontWeight: 500 },
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 8,
    },
    grid: {
      left: '3%',
      right: '3%',
      top: 50,
      bottom: 65,
      containLabel: true,
    },
    toolbox: {
      show: true,
      right: 10,
      top: 0,
      iconStyle: {
        borderColor: theme.mutedText,
      },
      emphasis: {
        iconStyle: {
          borderColor: '#6366f1',
        },
      },
      feature: {
        magicType: { type: ['bar', 'line', 'stack'] },
        restore: {},
        saveAsImage: { title: 'Export PNG', pixelRatio: 2 },
      },
    },
    xAxis: {
      type: 'category',
      data: periods,
      axisLine: { lineStyle: { color: theme.borderColor } },
      axisTick: { show: false },
      axisLabel: {
        color: theme.mutedText,
        fontSize: 11,
        interval: 'auto',
        rotate: periods.length > 15 ? 30 : 0,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Amount',
        nameTextStyle: { color: theme.mutedText, fontSize: 10 },
        splitLine: { lineStyle: { color: theme.splitLineColor, type: 'dashed' } },
        axisLine: { show: false },
        axisLabel: {
          color: theme.mutedText,
          fontSize: 11,
          formatter: (val) => formatCompactCurrency(val, currencySymbol),
        },
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        type: 'slider',
        show: periods.length > 8,
        bottom: 8,
        height: 22,
        borderColor: 'transparent',
        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)',
        fillerColor: darkMode ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.15)',
        handleStyle: {
          color: '#6366f1',
          borderColor: '#6366f1',
        },
        textStyle: { color: theme.mutedText, fontSize: 10 },
      },
    ],
    series: [
      {
        name: 'Revenue',
        type: 'bar',
        data: revenues,
        barMaxWidth: 32,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#6366f1' },
            { offset: 1, color: 'rgba(99, 102, 241, 0.4)' },
          ]),
        },
      },
      {
        name: 'Expenses',
        type: 'bar',
        data: expenses,
        barMaxWidth: 32,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#f43f5e' },
            { offset: 1, color: 'rgba(244, 63, 94, 0.4)' },
          ]),
        },
      },
      {
        name: 'Net Profit',
        type: 'line',
        data: profits,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3.5,
          color: '#10b981',
          shadowColor: 'rgba(16, 185, 129, 0.4)',
          shadowBlur: 10,
        },
        itemStyle: {
          color: '#10b981',
          borderColor: darkMode ? '#0f172a' : '#ffffff',
          borderWidth: 2,
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#94a3b8', type: 'dashed', width: 1 },
          data: [{ yAxis: 0, name: 'Break Even ($0)' }],
          label: {
            formatter: 'Break Even ($0)',
            position: 'end',
            color: theme.mutedText,
            fontSize: 10,
          },
        },
      },
    ],
  };
}

/**
 * 2. CUMULATIVE PROFITABILITY TRAJECTORY (Dynamic Area Wave + Peak/Trough markers)
 */
export function getCumulativeTrajectoryOption(chartData, currencySymbol = '$', darkMode = false) {
  const theme = getChartTheme(darkMode);
  const periods = chartData.map((d) => d.period);
  const cumulative = chartData.map((d) => d.cumulativeProfit);

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: theme.textColor, fontSize: 12 },
      extraCssText: 'box-shadow: 0 12px 24px -4px rgba(0,0,0,0.25); border-radius: 12px; backdrop-filter: blur(8px);',
      formatter: (params) => {
        if (!params || params.length === 0) return '';
        const item = params[0];
        const val = item.value;
        const color = val >= 0 ? '#10b981' : '#f43f5e';
        return `
          <div style="font-weight: 700; color: ${darkMode ? '#f8fafc' : '#0f172a'}; margin-bottom: 6px;">${item.axisValue}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
            <span style="color: ${theme.mutedText};">Cumulative Net Wealth:</span>
            <span style="font-weight: 700; font-family: monospace; color: ${color};">${formatCurrency(val, currencySymbol)}</span>
          </div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      top: 40,
      bottom: 55,
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: { title: 'Export PNG', pixelRatio: 2 },
        dataZoom: {},
      },
      right: 10,
      top: 0,
      iconStyle: { borderColor: theme.mutedText },
    },
    xAxis: {
      type: 'category',
      data: periods,
      boundaryGap: false,
      axisLine: { lineStyle: { color: theme.borderColor } },
      axisTick: { show: false },
      axisLabel: {
        color: theme.mutedText,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Accumulated Profit',
      nameTextStyle: { color: theme.mutedText, fontSize: 10 },
      splitLine: { lineStyle: { color: theme.splitLineColor, type: 'dashed' } },
      axisLine: { show: false },
      axisLabel: {
        color: theme.mutedText,
        fontSize: 11,
        formatter: (val) => formatCompactCurrency(val, currencySymbol),
      },
    },
    series: [
      {
        name: 'Cumulative Wealth',
        type: 'line',
        smooth: 0.35,
        data: cumulative,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3.5,
          color: '#10b981',
          shadowColor: 'rgba(16, 185, 129, 0.4)',
          shadowBlur: 10,
        },
        itemStyle: {
          color: '#10b981',
          borderColor: darkMode ? '#0f172a' : '#ffffff',
          borderWidth: 2,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.45)' },
            { offset: 0.7, color: 'rgba(16, 185, 129, 0.1)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.0)' },
          ]),
        },
        markPoint: {
          data: [
            { type: 'max', name: 'Peak Profit' },
            { type: 'min', name: 'Lowest Trough' },
          ],
          label: {
            formatter: (p) => formatCompactCurrency(p.value, currencySymbol),
            fontSize: 10,
            fontWeight: 'bold',
          },
          itemStyle: {
            color: '#6366f1',
          },
        },
        markLine: {
          symbol: 'none',
          data: [{ type: 'average', name: 'Avg Cumulative' }],
          lineStyle: { color: '#f59e0b', type: 'dashed' },
          label: {
            formatter: 'Avg: ' + currencySymbol + '{c}',
            position: 'middle',
            fontSize: 10,
            color: '#f59e0b',
          },
        },
      },
    ],
  };
}

/**
 * 3. CATEGORY DONUT CHART (With center total & rich hover)
 */
export function getCategoryDonutOption(categoryData, typeName = 'Expenses', currencySymbol = '$', darkMode = false) {
  const theme = getChartTheme(darkMode);
  const total = categoryData.reduce((acc, curr) => acc + curr.value, 0);

  const formattedData = categoryData.map((item, idx) => ({
    name: item.name,
    value: item.value,
    count: item.count,
    itemStyle: {
      color: ECHARTS_PALETTE[idx % ECHARTS_PALETTE.length],
      borderRadius: 6,
      borderColor: darkMode ? '#0f172a' : '#ffffff',
      borderWidth: 2,
    },
  }));

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: theme.textColor, fontSize: 12 },
      extraCssText: 'box-shadow: 0 12px 24px -4px rgba(0,0,0,0.25); border-radius: 12px; backdrop-filter: blur(8px);',
      formatter: (params) => {
        const valFormatted = formatCurrency(params.value, currencySymbol);
        const percent = params.percent.toFixed(1);
        const countStr = params.data.count ? `<div style="color: ${theme.mutedText}; font-size: 11px; margin-top: 4px;">Transactions: <b>${params.data.count}</b></div>` : '';
        return `
          <div style="font-weight: 700; color: ${darkMode ? '#f8fafc' : '#0f172a'}; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${params.color};"></span>
            ${params.name}
          </div>
          <div style="display: flex; justify-content: space-between; gap: 16px; margin-bottom: 4px;">
            <span style="color: ${theme.mutedText};">Amount:</span>
            <span style="font-weight: 700; font-family: monospace; color: ${darkMode ? '#ffffff' : '#0f172a'};">${valFormatted}</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 16px;">
            <span style="color: ${theme.mutedText};">Share of Total:</span>
            <span style="font-weight: 700; font-family: monospace; color: #6366f1;">${percent}%</span>
          </div>
          ${countStr}
        `;
      },
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      textStyle: { color: theme.textColor, fontSize: 11 },
      icon: 'circle',
      pageTextStyle: { color: theme.textColor },
    },
    series: [
      {
        name: typeName,
        type: 'pie',
        radius: ['52%', '78%'],
        center: ['50%', '46%'],
        avoidLabelOverlap: true,
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.1)',
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          scale: true,
          scaleSize: 8,
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold',
            color: theme.textColor,
            formatter: (params) => `${params.name}\n${formatCompactCurrency(params.value, currencySymbol)}`,
          },
        },
        labelLine: { show: false },
        data: formattedData,
      },
    ],
  };
}

/**
 * 4. CATEGORY TREEMAP HIERARCHY
 */
export function getCategoryTreemapOption(categoryData, typeName = 'Expenses', currencySymbol = '$', darkMode = false) {
  const theme = getChartTheme(darkMode);

  const formattedData = categoryData.map((item, idx) => ({
    name: item.name,
    value: item.value,
    itemStyle: {
      color: ECHARTS_PALETTE[idx % ECHARTS_PALETTE.length],
      borderColor: darkMode ? '#0f172a' : '#ffffff',
      borderWidth: 2,
      gapWidth: 2,
    },
  }));

  return {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: theme.textColor, fontSize: 12 },
      extraCssText: 'box-shadow: 0 12px 24px -4px rgba(0,0,0,0.25); border-radius: 12px;',
      formatter: (params) => {
        return `
          <div style="font-weight: 700; color: ${darkMode ? '#f8fafc' : '#0f172a'}; margin-bottom: 4px;">${params.name}</div>
          <div style="display: flex; justify-content: space-between; gap: 12px;">
            <span style="color: ${theme.mutedText};">Total:</span>
            <span style="font-weight: 700; font-family: monospace; color: #6366f1;">${formatCurrency(params.value, currencySymbol)}</span>
          </div>
        `;
      },
    },
    series: [
      {
        type: 'treemap',
        data: formattedData,
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          formatter: '{b}\n{c}',
          fontSize: 12,
          fontWeight: 'bold',
          color: '#ffffff',
        },
        levels: [
          {
            itemStyle: {
              borderColor: darkMode ? '#1e293b' : '#f8fafc',
              borderWidth: 2,
              gapWidth: 2,
            },
          },
        ],
      },
    ],
  };
}

/**
 * 5. 5-PILLAR FINANCIAL HEALTH RADAR
 */
export function getFinancialRadarOption(kpis, rows, currencySymbol = '$', darkMode = false) {
  const theme = getChartTheme(darkMode);

  // Pillar 1: Profit Margin Score (0 to 100)
  const marginScore = Math.min(100, Math.max(0, kpis.profitMargin * 2.5 + 20));

  // Pillar 2: Cost Discipline (Higher is better, 0-100)
  const expenseRatio = kpis.totalRevenue > 0 ? (kpis.totalExpenses / kpis.totalRevenue) * 100 : 100;
  const costDisciplineScore = Math.min(100, Math.max(0, 100 - expenseRatio));

  // Pillar 3: Win Ratio (% of profitable transactions)
  const winRatio = kpis.totalTransactions > 0 ? (kpis.profitableRowsCount / kpis.totalTransactions) * 100 : 0;

  // Pillar 4: Revenue Scale / Momentum (Normalized)
  const revenueScore = kpis.totalRevenue > 0 ? Math.min(100, Math.max(30, Math.log10(kpis.totalRevenue) * 18)) : 10;

  // Pillar 5: Profit Consistency (Low variance / stable growth)
  const consistencyScore = Math.min(100, Math.max(20, winRatio * 0.8 + (kpis.netProfit > 0 ? 20 : 0)));

  const currentMetrics = [
    Math.round(marginScore),
    Math.round(costDisciplineScore),
    Math.round(winRatio),
    Math.round(revenueScore),
    Math.round(consistencyScore),
  ];

  const benchmarkHealthy = [80, 75, 80, 85, 85];

  return {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      borderWidth: 1,
      textStyle: { color: theme.textColor, fontSize: 12 },
      extraCssText: 'border-radius: 12px;',
    },
    legend: {
      data: ['Your Business Profile', 'Top-Quartile Benchmark'],
      bottom: 0,
      textStyle: { color: theme.textColor, fontSize: 11 },
      icon: 'roundRect',
    },
    radar: {
      indicator: [
        { name: 'Margin Quality', max: 100 },
        { name: 'Cost Discipline', max: 100 },
        { name: 'Profitable Transactions', max: 100 },
        { name: 'Revenue Momentum', max: 100 },
        { name: 'Cash Stability', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: theme.textColor,
        fontSize: 11,
        fontWeight: 600,
      },
      splitLine: {
        lineStyle: {
          color: theme.splitLineColor,
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: darkMode
            ? ['rgba(30, 41, 59, 0.2)', 'rgba(30, 41, 59, 0.4)', 'rgba(30, 41, 59, 0.6)', 'rgba(30, 41, 59, 0.8)']
            : ['rgba(248, 250, 252, 0.4)', 'rgba(241, 245, 249, 0.6)', 'rgba(226, 232, 240, 0.5)', 'rgba(203, 213, 225, 0.4)'],
        },
      },
      axisLine: {
        lineStyle: {
          color: theme.borderColor,
        },
      },
    },
    series: [
      {
        name: 'Financial Health Scorecard',
        type: 'radar',
        data: [
          {
            value: currentMetrics,
            name: 'Your Business Profile',
            itemStyle: { color: '#6366f1' },
            lineStyle: { width: 3, color: '#6366f1' },
            areaStyle: { color: 'rgba(99, 102, 241, 0.35)' },
          },
          {
            value: benchmarkHealthy,
            name: 'Top-Quartile Benchmark',
            itemStyle: { color: '#10b981' },
            lineStyle: { width: 2, type: 'dashed', color: '#10b981' },
            areaStyle: { color: 'rgba(16, 185, 129, 0.1)' },
          },
        ],
      },
    ],
  };
}

/**
 * 6. WATERFALL / BRIDGE ANALYSIS (Revenue -> Expenses -> Net Profit)
 */
export function getWaterfallOption(kpis, categories, currencySymbol = '$', darkMode = false) {
  const theme = getChartTheme(darkMode);

  // Top expense items (up to 4) + Other
  const topExpenses = categories.expenseCategories.slice(0, 4);
  const topExpSum = topExpenses.reduce((sum, item) => sum + item.value, 0);
  const otherExp = Math.max(0, kpis.totalExpenses - topExpSum);

  const steps = [];
  steps.push({ name: 'Gross Revenue', value: kpis.totalRevenue, isTotal: true });

  topExpenses.forEach((exp) => {
    steps.push({ name: `Cost: ${exp.name}`, value: -exp.value, isExpense: true });
  });

  if (otherExp > 0) {
    steps.push({ name: 'Other Costs', value: -otherExp, isExpense: true });
  }

  steps.push({ name: 'Net Profit / Loss', value: kpis.netProfit, isFinal: true });

  // Calculate waterfall bar bases and values
  const xLabels = steps.map((s) => s.name);
  const placeholderData = [];
  const positiveBarData = [];
  const negativeBarData = [];

  let accumulated = 0;

  steps.forEach((step, idx) => {
    if (idx === 0) {
      // First step: Revenue
      placeholderData.push(0);
      positiveBarData.push(step.value);
      negativeBarData.push('-');
      accumulated = step.value;
    } else if (step.isFinal) {
      // Final step: Net Profit
      if (step.value >= 0) {
        placeholderData.push(0);
        positiveBarData.push(step.value);
        negativeBarData.push('-');
      } else {
        placeholderData.push(step.value);
        positiveBarData.push('-');
        negativeBarData.push(Math.abs(step.value));
      }
    } else {
      // Intermediate expense steps
      const expenseAmount = Math.abs(step.value);
      accumulated -= expenseAmount;
      placeholderData.push(accumulated);
      positiveBarData.push('-');
      negativeBarData.push(expenseAmount);
    }
  });

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
        let tar;
        if (params[1].value !== '-' && params[1].value !== undefined) {
          tar = params[1];
        } else {
          tar = params[2];
        }
        const valFormatted = formatCurrency(tar?.value || 0, currencySymbol);
        return `
          <div style="font-weight: 700; color: ${darkMode ? '#f8fafc' : '#0f172a'}; margin-bottom: 4px;">${tar?.name}</div>
          <div style="color: ${tar?.seriesName === 'Expense Deductions' ? '#f43f5e' : '#10b981'}; font-weight: 700; font-family: monospace;">
            ${tar?.seriesName === 'Expense Deductions' ? '-' : ''}${valFormatted}
          </div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      top: 30,
      bottom: 60,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLine: { lineStyle: { color: theme.borderColor } },
      axisTick: { show: false },
      axisLabel: {
        color: theme.textColor,
        fontSize: 11,
        interval: 0,
        rotate: xLabels.length > 4 ? 20 : 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: theme.splitLineColor, type: 'dashed' } },
      axisLabel: {
        color: theme.mutedText,
        formatter: (val) => formatCompactCurrency(val, currencySymbol),
      },
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'Total',
        silent: true,
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent',
        },
        data: placeholderData,
      },
      {
        name: 'Inflow & Net Wealth',
        type: 'bar',
        stack: 'Total',
        itemStyle: {
          color: '#10b981',
          borderRadius: 6,
        },
        data: positiveBarData,
      },
      {
        name: 'Expense Deductions',
        type: 'bar',
        stack: 'Total',
        itemStyle: {
          color: '#f43f5e',
          borderRadius: 6,
        },
        data: negativeBarData,
      },
    ],
  };
}

/**
 * 7. REVENUE VS EXPENSE SCATTER MATRIX (Outlier & Transaction Analysis)
 */
export function getScatterCorrelationOption(rows, currencySymbol = '$', darkMode = false) {
  const theme = getChartTheme(darkMode);

  const scatterData = rows.map((r) => [
    r.revenue,
    r.expense,
    r.profit,
    r.description || r.category,
    r.date,
  ]);

  const avgRev = rows.reduce((s, r) => s + r.revenue, 0) / (rows.length || 1);
  const avgExp = rows.reduce((s, r) => s + r.expense, 0) / (rows.length || 1);

  return {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: theme.tooltipBg,
      borderColor: theme.tooltipBorder,
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: theme.textColor, fontSize: 12 },
      extraCssText: 'box-shadow: 0 12px 24px -4px rgba(0,0,0,0.25); border-radius: 12px; backdrop-filter: blur(8px);',
      formatter: (params) => {
        const [rev, exp, profit, desc, date] = params.value;
        const profitColor = profit >= 0 ? '#10b981' : '#f43f5e';
        return `
          <div style="font-weight: 700; color: ${darkMode ? '#f8fafc' : '#0f172a'}; margin-bottom: 2px;">${desc}</div>
          <div style="color: ${theme.mutedText}; font-size: 10px; margin-bottom: 6px;">${date}</div>
          <div style="display: flex; justify-content: space-between; gap: 12px;">
            <span style="color: ${theme.mutedText};">Revenue:</span>
            <span style="font-weight: 600; font-family: monospace; color: #6366f1;">${formatCurrency(rev, currencySymbol)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 12px;">
            <span style="color: ${theme.mutedText};">Expense:</span>
            <span style="font-weight: 600; font-family: monospace; color: #f43f5e;">${formatCurrency(exp, currencySymbol)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 4px; padding-top: 4px; border-top: 1px solid ${theme.borderColor};">
            <span style="font-weight: 700; color: ${profitColor};">Net Profit:</span>
            <span style="font-weight: 700; font-family: monospace; color: ${profitColor};">${formatCurrency(profit, currencySymbol)}</span>
          </div>
        `;
      },
    },
    grid: {
      left: '4%',
      right: '4%',
      top: 30,
      bottom: 50,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'Revenue Inflow',
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: theme.mutedText, fontSize: 11 },
      axisLine: { lineStyle: { color: theme.borderColor } },
      splitLine: { lineStyle: { color: theme.splitLineColor, type: 'dashed' } },
      axisLabel: {
        color: theme.mutedText,
        formatter: (val) => formatCompactCurrency(val, currencySymbol),
      },
    },
    yAxis: {
      type: 'value',
      name: 'Expense Outflow',
      nameLocation: 'middle',
      nameGap: 38,
      nameTextStyle: { color: theme.mutedText, fontSize: 11 },
      axisLine: { lineStyle: { color: theme.borderColor } },
      splitLine: { lineStyle: { color: theme.splitLineColor, type: 'dashed' } },
      axisLabel: {
        color: theme.mutedText,
        formatter: (val) => formatCompactCurrency(val, currencySymbol),
      },
    },
    series: [
      {
        name: 'Transactions',
        type: 'scatter',
        symbolSize: (data) => {
          const p = Math.abs(data[2]);
          return Math.min(28, Math.max(8, Math.sqrt(p) * 0.8));
        },
        data: scatterData,
        itemStyle: {
          color: (params) => {
            const profit = params.value[2];
            return profit >= 0 ? 'rgba(16, 185, 129, 0.75)' : 'rgba(244, 63, 94, 0.75)';
          },
          borderColor: darkMode ? '#0f172a' : '#ffffff',
          borderWidth: 1.5,
          shadowBlur: 6,
          shadowColor: 'rgba(0,0,0,0.15)',
        },
        markLine: {
          lineStyle: { type: 'dashed', color: '#94a3b8' },
          data: [
            { xAxis: avgRev, name: 'Avg Revenue' },
            { yAxis: avgExp, name: 'Avg Expense' },
          ],
        },
      },
    ],
  };
}

/**
 * 8. MINI SPARKLINES FOR KPI CARDS
 */
export function getMiniSparklineOption(dataArray, color = '#6366f1', darkMode = false) {
  return {
    backgroundColor: 'transparent',
    grid: { left: 0, right: 0, top: 2, bottom: 2 },
    xAxis: { type: 'category', show: false },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data: dataArray,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${color}55` },
            { offset: 1, color: `${color}00` },
          ]),
        },
      },
    ],
  };
}

/**
 * 9. MARGIN GAUGE METER FOR KPI CARDS
 */
export function getMarginGaugeOption(profitMargin = 0, darkMode = false) {
  const isHealthy = profitMargin >= 20;
  const isModerate = profitMargin >= 0;
  const gaugeColor = isHealthy ? '#10b981' : isModerate ? '#6366f1' : '#f43f5e';

  return {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: -50,
        max: 50,
        splitNumber: 4,
        radius: '100%',
        center: ['50%', '75%'],
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.5, '#f43f5e'],
              [0.7, '#6366f1'],
              [1, '#10b981'],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 6,
          offsetCenter: [0, '-60%'],
          itemStyle: { color: gaugeColor },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '-15%'],
          fontSize: 14,
          fontWeight: 'bold',
          formatter: '{value}%',
          color: gaugeColor,
        },
        data: [{ value: Number(profitMargin.toFixed(1)) }],
      },
    ],
  };
}

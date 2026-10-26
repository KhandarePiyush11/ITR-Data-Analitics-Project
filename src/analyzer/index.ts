/**
 * FinPulse Business Financial Analyzer
 * Schema-Agnostic Dynamic Data Analyzer & Intelligence Engine
 * 
 * @module analyzer
 * @author Senior Data Architect & Principal Engineer
 */

import {
  UnifiedDataset,
  DatasetAnalysisResult,
  ColumnProfile,
  FinancialKpiSummary,
  HealthScorecard,
  ChartRecommendation,
  ColumnMappingOverrides,
} from '../types';
import { inferColumnType, cleanNumericValue } from './typeInference';
import { generateColumnStats } from './statisticalProfiler';
import { detectSemanticRole } from './semanticDetector';

/**
 * Computes dataset-level financial KPIs from inferred revenue, expense, profit, and tax columns,
 * with support for user mapping overrides and transaction type columns.
 */
export function extractFinancialKpis(
  dataset: UnifiedDataset,
  columns: Record<string, ColumnProfile>,
  mappingOverrides?: ColumnMappingOverrides
): FinancialKpiSummary {
  const columnProfiles = Object.values(columns);

  // Identify primary candidates by semantic role with smart fallbacks
  let revenueCol = mappingOverrides?.revenueColumn ?? columnProfiles.find((c) => c.semanticRole === 'revenue')?.name;
  let expenseCol = mappingOverrides?.expenseColumn ?? columnProfiles.find((c) => c.semanticRole === 'expense')?.name;
  let profitCol = mappingOverrides?.profitColumn ?? columnProfiles.find((c) => c.semanticRole === 'profit')?.name;
  let taxCol = mappingOverrides?.taxColumn ?? columnProfiles.find((c) => c.semanticRole === 'tax')?.name;
  let dateCol = mappingOverrides?.dateColumn ?? columnProfiles.find((c) => c.semanticRole === 'timestamp')?.name;
  let categoryCol = mappingOverrides?.categoryColumn ?? columnProfiles.find((c) => c.semanticRole === 'category')?.name;
  let typeCol = mappingOverrides?.typeColumn ?? columnProfiles.find((c) => 
    /^(type|txn_type|transaction_type|flow|flow_type|entry_type|cr_dr|dr_cr|d_c)$/i.test(c.name)
  )?.name;

  // Fallbacks if semantic roles are not detected: filter out non-financial numerics (quantity, rate, tax, id)
  const financialNumericCols = columnProfiles.filter((c) => {
    if (c.semanticRole === 'quantity' || c.semanticRole === 'rate' || c.semanticRole === 'tax' || c.semanticRole === 'entity_id') {
      return false;
    }
    return c.inferredType === 'numeric' || c.inferredType === 'currency';
  });

  if (!revenueCol && !expenseCol && financialNumericCols.length > 0) {
    revenueCol = financialNumericCols[0]?.name;
    if (financialNumericCols.length > 1) expenseCol = financialNumericCols[1]?.name;
  }

  if (!dateCol) {
    dateCol = columnProfiles.find((c) => c.inferredType === 'date')?.name ||
              columnProfiles.find((c) => /date|time|period|month|day|year/i.test(c.name))?.name;
  }

  if (!categoryCol) {
    categoryCol = columnProfiles.find((c) => c.inferredType === 'categorical')?.name ||
                  columnProfiles.find((c) => /cat|type|desc|department|item|group|segment/i.test(c.name))?.name;
  }

  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalTax = 0;
  let profitableCount = 0;
  let lossCount = 0;
  let detectedSymbol = mappingOverrides?.currencySymbol || '$';

  // Extract currency symbol if present and not manually overridden
  if (!mappingOverrides?.currencySymbol) {
    const currencyField = columnProfiles.find(
      (c) => c.numericStats?.currencySymbol && c.numericStats.currencySymbol !== '$'
    );
    if (currencyField?.numericStats?.currencySymbol) {
      detectedSymbol = currencyField.numericStats.currencySymbol;
    }
  }

  const rows = dataset.rows;

  rows.forEach((row) => {
    let rev = 0;
    let exp = 0;
    const tax = taxCol ? Math.abs(cleanNumericValue(row[taxCol]) || 0) : 0;

    if (revenueCol && expenseCol && revenueCol !== expenseCol) {
      rev = cleanNumericValue(row[revenueCol]) || 0;
      exp = Math.abs(cleanNumericValue(row[expenseCol]) || 0);
    } else if (revenueCol) {
      const rawVal = cleanNumericValue(row[revenueCol]) || 0;
      const typeVal = typeCol ? String(row[typeCol] || '').toLowerCase().trim() : '';

      if (typeVal) {
        // If row has a Type column indicating expense/debit
        if (/exp|deb|cost|pay|out|withdr|fee|charge|bill/i.test(typeVal)) {
          exp = Math.abs(rawVal);
        } else if (/inc|rev|cred|dep|sale|earn|inflow/i.test(typeVal)) {
          rev = Math.abs(rawVal);
        } else if (rawVal < 0) {
          exp = Math.abs(rawVal);
        } else {
          rev = rawVal;
        }
      } else {
        // Standard single-column accounting: negative is expense, positive is revenue
        if (rawVal < 0) {
          exp = Math.abs(rawVal);
        } else {
          rev = rawVal;
        }
      }
    } else if (expenseCol) {
      exp = Math.abs(cleanNumericValue(row[expenseCol]) || 0);
    }

    totalRevenue += rev;
    totalExpenses += exp;
    totalTax += tax;

    let rowProfit = 0;
    if (profitCol && row[profitCol] !== undefined) {
      rowProfit = cleanNumericValue(row[profitCol]) || 0;
    } else {
      rowProfit = rev - exp;
    }

    if (rowProfit > 0) profitableCount++;
    else if (rowProfit < 0) lossCount++;
  });

  const hasFinancialMetrics = Boolean(revenueCol || expenseCol || profitCol || numericCols.length > 0);

  // If profit column wasn't explicitly present, calculate Net Profit = Revenue - Expense - Tax
  const netProfit = profitCol && columns[profitCol]?.numericStats
    ? columns[profitCol].numericStats!.sum
    : totalRevenue - totalExpenses - totalTax;

  const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const effectiveTaxRatePercent = totalRevenue > 0 ? (totalTax / totalRevenue) * 100 : 0;
  const avgTxnValue = rows.length > 0 ? totalRevenue / rows.length : 0;

  return {
    hasFinancialMetrics,
    currencySymbol: detectedSymbol,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveTaxRatePercent: Math.round(effectiveTaxRatePercent * 10) / 10,
    transactionCount: rows.length,
    profitableTransactionsCount: profitableCount,
    lossTransactionsCount: lossCount,
    averageTransactionValue: Math.round(avgTxnValue * 100) / 100,
    revenueColumn: revenueCol,
    expenseColumn: expenseCol,
    profitColumn: profitCol,
    taxColumn: taxCol,
    dateColumn: dateCol,
    categoryColumn: categoryCol,
    typeColumn: typeCol,
  };
}

/**
 * Computes business health scorecard and strategic optimization recommendations
 */
export function evaluateHealthScorecard(kpis: FinancialKpiSummary): HealthScorecard {
  let score = 50;

  // Margin component (-30 to +30)
  if (kpis.profitMarginPercent >= 30) score += 30;
  else if (kpis.profitMarginPercent >= 15) score += 20;
  else if (kpis.profitMarginPercent >= 5) score += 10;
  else if (kpis.profitMarginPercent >= 0) score += 0;
  else score -= 25;

  // Expense efficiency (-15 to +15)
  const expenseRatio = kpis.totalRevenue > 0 
    ? (kpis.totalExpenses / kpis.totalRevenue) * 100 
    : 100;

  if (expenseRatio <= 50) score += 15;
  else if (expenseRatio <= 70) score += 10;
  else if (expenseRatio <= 85) score += 0;
  else score -= 15;

  // Win rate component (-10 to +10)
  const winRate = kpis.transactionCount > 0 
    ? (kpis.profitableTransactionsCount / kpis.transactionCount) * 100 
    : 0;

  if (winRate >= 80) score += 10;
  else if (winRate >= 60) score += 5;
  else score -= 10;

  score = Math.max(10, Math.min(99, Math.round(score)));

  let letterGrade: HealthScorecard['letterGrade'] = 'B';
  let verdict = 'Moderate Health & Stable Operations';

  if (score >= 90) {
    letterGrade = 'A+';
    verdict = 'Outstanding Profitability & High Operational Resilience';
  } else if (score >= 80) {
    letterGrade = 'A';
    verdict = 'Strong Financial Position with Scalable Margins';
  } else if (score >= 70) {
    letterGrade = 'B';
    verdict = 'Healthy Core Business with Manageable Cost Structures';
  } else if (score >= 55) {
    letterGrade = 'C';
    verdict = 'Tight Margins; Requires Active Expense Rationalization';
  } else if (score >= 40) {
    letterGrade = 'D';
    verdict = 'Financial Vulnerability; Outflows Outpacing Inflows';
  } else {
    letterGrade = 'F';
    verdict = 'Severe Cash Drain & Operating Deficit';
  }

  // Generate actionable insights
  const actionableInsights: HealthScorecard['actionableInsights'] = [];

  if (kpis.totalExpenses === 0 && kpis.totalRevenue > 0) {
    actionableInsights.push({
      id: 'info-revenue-stream',
      type: 'optimization',
      title: 'Gross Inflow & Sales Velocity Ledger',
      impactEstimation: `${kpis.currencySymbol}${kpis.totalRevenue.toLocaleString()} Top-Line Volume`,
      recommendation: 'All captured transactions represent revenue entries. To track net operating margins, you can map or upload an expense/debit column via the "Field Mapping" modal in the top bar.',
      priority: 'medium',
    });
  }

  if (expenseRatio > 65 && kpis.totalExpenses > 0) {
    actionableInsights.push({
      id: 'opt-cogs-audit',
      type: 'optimization',
      title: 'Operating Expense Containment',
      impactEstimation: `+${kpis.currencySymbol}${(kpis.totalExpenses * 0.1).toLocaleString(undefined, { maximumFractionDigits: 0 })} Potential Annual Savings`,
      recommendation: `Operating expenses consume ${expenseRatio.toFixed(1)}% of top-line revenue. Initiating a vendor audit and trimming 10% from secondary cost centers will immediately expand net margin.`,
      priority: 'high',
    });
  }

  if (kpis.lossTransactionsCount > 0) {
    actionableInsights.push({
      id: 'risk-negative-margin',
      type: 'risk_warning',
      title: `Remediate ${kpis.lossTransactionsCount} Loss-Making Entries`,
      impactEstimation: 'Margin Protection',
      recommendation: `${kpis.lossTransactionsCount} transactions reflect negative contribution margin. Review product discounting, freight absorption, or minimum order thresholds.`,
      priority: 'medium',
    });
  }

  if (kpis.profitMarginPercent >= 25) {
    actionableInsights.push({
      id: 'growth-reinvestment',
      type: 'growth_opportunity',
      title: 'Capitalize on Premium Margin Flywheel',
      impactEstimation: 'Accelerate Scalable Growth',
      recommendation: `With an enviable ${kpis.profitMarginPercent.toFixed(1)}% net margin, the business generates strong surplus cash flow to reinvest into customer acquisition and channel expansion.`,
      priority: 'medium',
    });
  }

  if (kpis.totalTax > 0) {
    actionableInsights.push({
      id: 'tax-depreciation-review',
      type: 'tax_saving',
      title: 'Tax Shield & Deductions Optimization',
      impactEstimation: `Effective Tax Rate: ${kpis.effectiveTaxRatePercent.toFixed(1)}%`,
      recommendation: `Recorded tax liability stands at ${kpis.currencySymbol}${kpis.totalTax.toLocaleString()}. Ensure all eligible asset depreciation (Section 179 / R&D credits) are fully claimed prior to filing.`,
      priority: 'low',
    });
  }

  return {
    overallScore: score,
    letterGrade,
    verdict,
    metrics: {
      marginGrade: `${kpis.profitMarginPercent.toFixed(1)}%`,
      expenseEfficiencyRatio: Math.round(expenseRatio * 10) / 10,
      cashGenerationRatio: Math.round((kpis.netProfit / (kpis.totalRevenue || 1)) * 100) / 100,
      winRate: Math.round(winRate * 10) / 10,
    },
    actionableInsights,
  };
}

/**
 * Automatically synthesizes intelligent ECharts recommendations based on column types and distributions
 */
export function recommendVisualizations(
  columns: Record<string, ColumnProfile>
): ChartRecommendation[] {
  const recommendations: ChartRecommendation[] = [];
  const profiles = Object.values(columns);

  const dateCols = profiles.filter((c) => c.inferredType === 'date');
  const numericCols = profiles.filter(
    (c) => c.inferredType === 'numeric' || c.inferredType === 'currency'
  );
  const categoricalCols = profiles.filter((c) => c.inferredType === 'categorical');

  // 1. Time-Series Trend Line / Area Chart (Date + Numerics)
  if (dateCols.length > 0 && numericCols.length > 0) {
    const primaryDate = dateCols[0];
    const topMetrics = numericCols
      .filter((c) => c.semanticRole === 'revenue' || c.semanticRole === 'expense' || c.semanticRole === 'profit')
      .map((c) => c.name);

    const metricsToUse = topMetrics.length > 0 ? topMetrics : numericCols.slice(0, 3).map((c) => c.name);

    recommendations.push({
      id: 'rec-time-series',
      title: 'Financial Trend & Growth Trajectory',
      description: `Timeline trajectory of ${metricsToUse.join(' & ')} across time with average baseline and turning points.`,
      chartType: 'line',
      confidenceScore: 0.95,
      dimensionKey: primaryDate.name,
      metricKeys: metricsToUse,
      aggregation: 'sum',
      dateGranularity: 'month',
      showTrendline: true,
    });
  }

  // 2. Categorical Distribution / Donut Chart (Low cardinality categorical + Numeric)
  const donutEligible = categoricalCols.find(
    (c) => c.categoricalStats && c.categoricalStats.uniqueCount >= 2 && c.categoricalStats.uniqueCount <= 8
  );

  if (donutEligible && numericCols.length > 0) {
    const primaryMetric = numericCols.find((c) => c.semanticRole === 'expense' || c.semanticRole === 'revenue') || numericCols[0];

    recommendations.push({
      id: 'rec-donut-share',
      title: `${donutEligible.name} Distribution Breakdown`,
      description: `Proportional allocation of ${primaryMetric.name} grouped by ${donutEligible.name}.`,
      chartType: 'donut',
      confidenceScore: 0.9,
      dimensionKey: donutEligible.name,
      metricKeys: [primaryMetric.name],
      aggregation: 'sum',
    });
  }

  // 3. Ranked Pareto / Bar Chart (Categorical + Primary Metric)
  if (categoricalCols.length > 0 && numericCols.length > 0) {
    const primaryCat = categoricalCols[0];
    const primaryMetric = numericCols.find((c) => c.semanticRole === 'revenue') || numericCols[0];

    recommendations.push({
      id: 'rec-ranked-bar',
      title: `Performance by ${primaryCat.name}`,
      description: `Ranked comparison of ${primaryMetric.name} across ${primaryCat.name} segments.`,
      chartType: 'bar',
      confidenceScore: 0.88,
      dimensionKey: primaryCat.name,
      metricKeys: [primaryMetric.name],
      aggregation: 'sum',
    });
  }

  // 4. Multi-Metric Stacked Comparison (Multiple Numerics)
  if (numericCols.length >= 2 && categoricalCols.length > 0) {
    const catCol = categoricalCols[0];
    const metricKeys = numericCols.slice(0, 3).map((c) => c.name);

    recommendations.push({
      id: 'rec-multi-bar',
      title: `Multi-Metric Overview by ${catCol.name}`,
      description: `Side-by-side metric comparison across ${catCol.name}.`,
      chartType: 'stacked_bar',
      confidenceScore: 0.82,
      dimensionKey: catCol.name,
      metricKeys,
      aggregation: 'sum',
    });
  }

  return recommendations;
}

/**
 * Primary DataAnalyzer entry point.
 * Performs end-to-end schema inference, statistical profiling, KPI extraction,
 * and adaptive chart synthesis for any normalized tabular dataset.
 * 
 * @param dataset Standardized UnifiedDataset
 * @returns DatasetAnalysisResult
 */
export function analyzeDataset(dataset: UnifiedDataset): DatasetAnalysisResult {
  const { headers, rows } = dataset;
  const columnProfiles: Record<string, ColumnProfile> = {};

  // 1. Profile each individual column
  headers.forEach((header, index) => {
    const columnValues = rows.map((r) => r[header]);
    const { inferredType, confidence: typeConfidence } = inferColumnType(columnValues, header);
    const { role: semanticRole, confidence: roleConfidence } = detectSemanticRole(
      header,
      inferredType,
      columnValues
    );
    const stats = generateColumnStats(columnValues, inferredType);

    const nullCount = columnValues.filter(
      (v) => v === null || v === undefined || String(v).trim() === ''
    ).length;

    columnProfiles[header] = {
      name: header,
      index,
      inferredType,
      typeConfidence,
      semanticRole,
      roleConfidence,
      nullCount,
      nullPercentage: rows.length > 0 ? Math.round((nullCount / rows.length) * 1000) / 10 : 0,
      ...stats,
      sampleValues: columnValues.filter((v) => v !== null && v !== undefined && String(v).trim() !== '').slice(0, 5),
    };
  });

  // 2. Synthesize Financial KPIs
  const financialKpis = extractFinancialKpis(dataset, columnProfiles);

  // 3. Evaluate Business Health Scorecard
  const healthScorecard = evaluateHealthScorecard(financialKpis);

  // 4. Recommend Dynamic Charts
  const recommendedCharts = recommendVisualizations(columnProfiles);

  return {
    dataset,
    columns: columnProfiles,
    columnList: Object.values(columnProfiles),
    financialKpis,
    healthScorecard,
    recommendedCharts,
  };
}

export * from './typeInference';
export * from './statisticalProfiler';
export * from './semanticDetector';
export * from './growthEngine';


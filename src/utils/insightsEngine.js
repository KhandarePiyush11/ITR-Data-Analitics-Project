import { formatCurrency, formatPercentage } from './formatters.js';

/**
 * Intelligent Business Insights & Financial Health Scorecard Engine.
 * Evaluates parsed financial metrics, timeline aggregations, and category distributions
 * to generate executive grade scores and actionable business recommendations.
 */

export function generateBusinessInsights(kpis, timeline, categories, currencySymbol = '$') {
  const {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    totalTransactions,
    profitableRowsCount,
    avgTransactionProfit,
  } = kpis;

  const rawTimeline = timeline.monthly || timeline.raw || [];
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 100;
  const winRate = totalTransactions > 0 ? (profitableRowsCount / totalTransactions) * 100 : 0;

  // 1. Calculate Comprehensive Health Score (0 - 100)
  let healthScore = 50;

  // Margin component (-30 to +30)
  if (profitMargin >= 30) healthScore += 30;
  else if (profitMargin >= 15) healthScore += 20;
  else if (profitMargin >= 5) healthScore += 10;
  else if (profitMargin >= 0) healthScore += 0;
  else healthScore -= 25;

  // Expense Discipline component (-15 to +15)
  if (expenseRatio <= 50) healthScore += 15;
  else if (expenseRatio <= 70) healthScore += 10;
  else if (expenseRatio <= 85) healthScore += 0;
  else healthScore -= 15;

  // Win-rate component (-10 to +10)
  if (winRate >= 80) healthScore += 10;
  else if (winRate >= 60) healthScore += 5;
  else healthScore -= 10;

  // Trajectory component (-10 to +10)
  if (rawTimeline.length >= 2) {
    const firstHalf = rawTimeline.slice(0, Math.floor(rawTimeline.length / 2));
    const secondHalf = rawTimeline.slice(Math.floor(rawTimeline.length / 2));

    const firstSum = firstHalf.reduce((s, d) => s + d.profit, 0);
    const secondSum = secondHalf.reduce((s, d) => s + d.profit, 0);

    if (secondSum > firstSum) healthScore += 10;
    else if (secondSum < firstSum) healthScore -= 10;
  }

  healthScore = Math.max(10, Math.min(99, Math.round(healthScore)));

  // Assign Grade
  let grade = 'B';
  let gradeColor = 'text-indigo-600 dark:text-indigo-400';
  let gradeBg = 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800';
  let statusSummary = 'Balanced Financial Health';

  if (healthScore >= 90) {
    grade = 'A+';
    gradeColor = 'text-emerald-600 dark:text-emerald-400';
    gradeBg = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    statusSummary = 'Exceptional Profitability & Resilience';
  } else if (healthScore >= 80) {
    grade = 'A';
    gradeColor = 'text-emerald-600 dark:text-emerald-400';
    gradeBg = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    statusSummary = 'Strong Sustainable Margin Health';
  } else if (healthScore >= 70) {
    grade = 'B+';
    gradeColor = 'text-cyan-600 dark:text-cyan-400';
    gradeBg = 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800';
    statusSummary = 'Good Performance with Growth Upside';
  } else if (healthScore >= 60) {
    grade = 'B';
    gradeColor = 'text-indigo-600 dark:text-indigo-400';
    gradeBg = 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800';
    statusSummary = 'Moderate Operational Stability';
  } else if (healthScore >= 50) {
    grade = 'C+';
    gradeColor = 'text-amber-600 dark:text-amber-400';
    gradeBg = 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
    statusSummary = 'High Cost Absorption Warning';
  } else {
    grade = 'D';
    gradeColor = 'text-rose-600 dark:text-rose-400';
    gradeBg = 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
    statusSummary = 'Net Margin Deficit - Needs Restructuring';
  }

  // 2. Identify Top Category Drivers
  const topExpense = categories.expenseCategories[0] || null;
  const topRevenue = categories.revenueCategories[0] || null;

  const topExpenseShare = topExpense && totalExpenses > 0 ? (topExpense.value / totalExpenses) * 100 : 0;
  const topRevenueShare = topRevenue && totalRevenue > 0 ? (topRevenue.value / totalRevenue) * 100 : 0;

  // 3. Strategic Actionable Recommendations
  const recommendations = [];

  if (topExpense) {
    const savingsTarget = topExpense.value * 0.1;
    recommendations.push({
      type: 'cost_reduction',
      title: `Optimize Largest Cost Center: "${topExpense.name}"`,
      impact: `+${formatCurrency(savingsTarget, currencySymbol)} potential annual gain`,
      description: `"${topExpense.name}" represents ${topExpenseShare.toFixed(1)}% (${formatCurrency(topExpense.value, currencySymbol)}) of all expenses. Negotiating a 10% efficiency discount will directly increase your net bottom line.`,
      icon: 'Scissors',
      badgeColor: 'rose',
    });
  }

  if (profitMargin < 20) {
    recommendations.push({
      type: 'pricing_power',
      title: 'Implement Targeted 5% Price / Value Adjustments',
      impact: `+${formatCurrency(totalRevenue * 0.05, currencySymbol)} gross margin uplift`,
      description: `Your net margin is currently ${profitMargin.toFixed(1)}%. A 5% price improvement across high-demand offerings will significantly expand your operating buffer without impacting transaction volume.`,
      icon: 'TrendingUp',
      badgeColor: 'indigo',
    });
  } else {
    recommendations.push({
      type: 'reinvestment',
      title: 'Capitalize on High-Margin Retainers & Expansion',
      impact: 'Accelerate enterprise flywheel',
      description: `With a healthy ${profitMargin.toFixed(1)}% margin, the business has solid free cash flow to reinvest into high-ROI marketing and strategic customer acquisition.`,
      icon: 'Rocket',
      badgeColor: 'emerald',
    });
  }

  if (winRate < 75) {
    recommendations.push({
      type: 'loss_containment',
      title: `Audit ${totalTransactions - profitableRowsCount} Unprofitable / Deficit Records`,
      impact: 'Eliminate negative-margin drag',
      description: `${(100 - winRate).toFixed(0)}% of transactions yielded negative or zero contribution margin. Review discounting rules and contract minimums to avoid margin dilution.`,
      icon: 'ShieldAlert',
      badgeColor: 'amber',
    });
  } else {
    recommendations.push({
      type: 'volume_scalability',
      title: 'Strong Transaction Discipline Across Channels',
      impact: `${winRate.toFixed(0)}% positive transaction rate`,
      description: 'The portfolio demonstrates consistent unit economics with a majority of entries generating positive incremental cash flow.',
      icon: 'CheckCircle2',
      badgeColor: 'cyan',
    });
  }

  return {
    score: healthScore,
    grade,
    gradeColor,
    gradeBg,
    statusSummary,
    expenseRatio: expenseRatio.toFixed(1),
    winRate: winRate.toFixed(0),
    topExpense: topExpense ? { name: topExpense.name, value: topExpense.value, share: topExpenseShare.toFixed(1) } : null,
    topRevenue: topRevenue ? { name: topRevenue.name, value: topRevenue.value, share: topRevenueShare.toFixed(1) } : null,
    recommendations,
  };
}

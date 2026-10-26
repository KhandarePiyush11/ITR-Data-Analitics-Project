/**
 * FinPulse Business Financial Analyzer
 * Intelligent Business Growth & Strategic Future Suggestion Engine
 * 
 * Synthesizes business model, strategic objectives, and operational stage
 * with actual financial ledger KPIs to formulate data-driven growth strategies.
 * 
 * @module analyzer/growthEngine
 */

import { 
  FinancialKpiSummary, 
  UnifiedDataset, 
  BusinessContext, 
  GrowthSuggestionAnalysis,
  GrowthStrategicLever,
  GrowthRoadmapPhase,
  GrowthBenchmark,
  BusinessType
} from '../types';
import { cleanNumericValue } from './typeInference';

export const DEFAULT_BUSINESS_CONTEXT: BusinessContext = {
  businessType: 'ecommerce',
  growthPriority: 'revenue',
  businessStage: 'growth',
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, { name: string; icon: string; desc: string }> = {
  ecommerce: {
    name: 'E-Commerce & Retail',
    icon: '🛍️',
    desc: 'Online stores, direct-to-consumer (D2C), multi-channel retail',
  },
  saas: {
    name: 'B2B SaaS & Tech',
    icon: '💻',
    desc: 'Subscription software, digital platforms, cloud services',
  },
  services: {
    name: 'Services & Agency',
    icon: '💼',
    desc: 'Consulting, marketing agencies, legal, professional advisory',
  },
  manufacturing: {
    name: 'Manufacturing & Wholesale',
    icon: '🏭',
    desc: 'Industrial production, B2B wholesale distribution, fabrication',
  },
  hospitality: {
    name: 'Restaurant & Hospitality',
    icon: '☕',
    desc: 'Cafes, food & beverage, hotels, event spaces',
  },
  healthcare: {
    name: 'Healthcare & Clinics',
    icon: '🏥',
    desc: 'Medical practices, dental, therapy, wellness centers',
  },
  general: {
    name: 'General Business & Trade',
    icon: '🏢',
    desc: 'Commercial trading, multi-discipline or hybrid business',
  },
};

/**
 * Analyzes financial KPIs alongside user-provided business context
 * to generate a tailored strategic growth blueprint.
 */
export function generateGrowthSuggestions(
  kpis: FinancialKpiSummary,
  dataset: UnifiedDataset,
  context: BusinessContext = DEFAULT_BUSINESS_CONTEXT
): GrowthSuggestionAnalysis {
  const sym = kpis.currencySymbol || '$';
  const totalRev = Number(kpis.totalRevenue) || 0;
  const totalExp = Number(kpis.totalExpenses) || 0;
  const netProfit = Number(kpis.netProfit) || (totalRev - totalExp);
  const marginPct = Number(kpis.profitMarginPercent) || (totalRev > 0 ? (netProfit / totalRev) * 100 : 0);
  const txnCount = kpis.transactionCount || dataset.rows.length || 1;
  const avgTicket = totalRev > 0 ? totalRev / txnCount : 0;
  const expenseRatio = totalRev > 0 ? (totalExp / totalRev) * 100 : 100;

  // 1. Analyze Category Highlights for context
  let topExpenseCategory = 'Operating Costs';
  let topExpenseAmount = 0;
  let topRevenueCategory = 'Primary Sales';
  let topRevenueAmount = 0;

  const { categoryColumn, expenseColumn, revenueColumn } = kpis;
  const catCol = categoryColumn || dataset.headers.find(h => /cat|dept|type|segment/i.test(h));
  const expCol = expenseColumn || dataset.headers.find(h => /exp|cost|debit|outflow/i.test(h));
  const revCol = revenueColumn || dataset.headers.find(h => /rev|sale|income|credit|inflow/i.test(h));

  if (catCol && dataset.rows.length > 0) {
    const expMap: Record<string, number> = {};
    const revMap: Record<string, number> = {};

    dataset.rows.forEach((r) => {
      const cat = String(r[catCol] || 'General').trim();
      if (expCol) {
        const val = Math.abs(cleanNumericValue(r[expCol]) || 0);
        expMap[cat] = (expMap[cat] || 0) + val;
      }
      if (revCol) {
        const val = cleanNumericValue(r[revCol]) || 0;
        revMap[cat] = (revMap[cat] || 0) + val;
      }
    });

    for (const [c, a] of Object.entries(expMap)) {
      if (a > topExpenseAmount) {
        topExpenseAmount = a;
        topExpenseCategory = c;
      }
    }
    for (const [c, a] of Object.entries(revMap)) {
      if (a > topRevenueAmount) {
        topRevenueAmount = a;
        topRevenueCategory = c;
      }
    }
  }

  const revenueConcentration = totalRev > 0 ? (topRevenueAmount / totalRev) * 100 : 0;

  // 2. Compute Growth Readiness Score (0-100)
  let score = 55;
  if (marginPct >= 25) score += 20;
  else if (marginPct >= 15) score += 12;
  else if (marginPct >= 5) score += 5;
  else if (marginPct < 0) score -= 25;

  if (expenseRatio <= 60) score += 15;
  else if (expenseRatio <= 75) score += 5;
  else score -= 15;

  if (kpis.profitableTransactionsCount && txnCount > 0) {
    const winRate = (kpis.profitableTransactionsCount / txnCount) * 100;
    if (winRate >= 75) score += 10;
    else if (winRate < 50) score -= 10;
  }

  score = Math.max(15, Math.min(98, Math.round(score)));

  let readinessTier: GrowthSuggestionAnalysis['readinessTier'] = 'Strong';
  if (score >= 80) readinessTier = 'Accelerated';
  else if (score >= 65) readinessTier = 'Strong';
  else if (score >= 45) readinessTier = 'Needs Optimization';
  else readinessTier = 'Turnaround Required';

  // 3. Mathematical Upside Projection
  let upsideMultiplier = 0.15; // default +15%
  if (context.businessStage === 'early') upsideMultiplier = 0.22;
  else if (context.businessStage === 'growth') upsideMultiplier = 0.16;
  else upsideMultiplier = 0.10;

  if (context.growthPriority === 'revenue') upsideMultiplier += 0.04;

  const projectedRevenueUpsidePercent = Math.round(upsideMultiplier * 1000) / 10;
  const projectedRevenueUpsideAmount = Math.round(totalRev * (projectedRevenueUpsidePercent / 100));

  let marginLift = 3.5;
  if (context.growthPriority === 'margin') marginLift = 5.0;
  else if (expenseRatio > 70) marginLift = 4.2;

  const projectedMarginLiftPercent = marginLift;
  const directExpenseSavings = Math.round(totalExp * 0.07);
  const incrementalGrossProfit = Math.round(projectedRevenueUpsideAmount * Math.max(0.18, marginPct / 100));
  const projectedProfitLiftAmount = directExpenseSavings + incrementalGrossProfit;

  // 4. Primary Bottleneck Identification
  let primaryBottleneck = 'Expense efficiency and margin capture';
  if (marginPct < 0) {
    primaryBottleneck = 'Negative unit margins draining operating cash';
  } else if (revenueConcentration > 60) {
    primaryBottleneck = `Revenue concentration risk: ${revenueConcentration.toFixed(0)}% generated by "${topRevenueCategory}"`;
  } else if (expenseRatio > 80) {
    primaryBottleneck = `High operating burn rate (${expenseRatio.toFixed(0)}% of revenue absorbed by expenses, notably ${topExpenseCategory})`;
  } else if (context.growthPriority === 'cashflow') {
    primaryBottleneck = 'Working capital timing and cash collection lag';
  } else {
    primaryBottleneck = 'Top-line acquisition velocity and customer order value expansion';
  }

  // 5. Build Tailored Strategic Levers
  const strategicLevers: GrowthStrategicLever[] = [];

  // Industry-Specific High-Yield Levers
  switch (context.businessType) {
    case 'ecommerce':
      strategicLevers.push({
        id: 'ecom-aov-expansion',
        category: 'revenue',
        title: 'Dynamic Average Order Value (AOV) Ladder',
        priority: 'critical',
        impactEstimation: `+12% to +18% Topline (${sym}${Math.round(totalRev * 0.14).toLocaleString()})`,
        description: `Your current baseline average ticket is approximately ${sym}${avgTicket.toFixed(0)}. Implementing free shipping thresholds set 20-25% higher (${sym}${(avgTicket * 1.22).toFixed(0)}) and 1-click cart cross-sells will reliably increase transaction basket size.`,
        actionItems: [
          `Set free shipping or gift tier at ${sym}${(avgTicket * 1.25).toFixed(0)} to encourage multi-item baskets`,
          `Bundle high-margin accessories with top selling "${topRevenueCategory}" items`,
          'Automate 3-part abandoned checkout SMS/Email sequence within 60 minutes of exit',
        ],
      });

      strategicLevers.push({
        id: 'ecom-cogs-freight',
        category: 'margin',
        title: `Trim ${topExpenseCategory} & Freight Absorption`,
        priority: 'high',
        impactEstimation: `+${sym}${Math.round(topExpenseAmount * 0.08 || totalExp * 0.05).toLocaleString()} Net Savings`,
        description: `Operating expenses in "${topExpenseCategory}" represent significant capital outflow. Auditing fulfillment carriers, packaging dimensions, and payment gateway fees will reclaim margin immediately.`,
        actionItems: [
          'Audit packaging dimensional weight tiers to reduce zone-based carrier surcharges',
          'Consolidate supplier purchasing into scheduled monthly replenishment for freight bulk rates',
          'Enforce strict return restocking fees for non-defective returns',
        ],
      });

      strategicLevers.push({
        id: 'ecom-retention-vip',
        category: 'retention',
        title: 'VIP Repeat Customer Re-order Engine',
        priority: 'medium',
        impactEstimation: '2.4x Higher Customer LTV',
        description: 'First-time customer acquisition costs are at historic highs. Transitioning buyers into 60-day replenishment subscriptions creates predictable baseline revenue.',
        actionItems: [
          'Deploy post-purchase replenishment reminder email at day 30 and 45',
          'Create tiered VIP loyalty incentives for customers reaching 3+ lifetime orders',
          'Offer 10% discount on automated recurring subscriptions',
        ],
      });
      break;

    case 'saas':
      strategicLevers.push({
        id: 'saas-annual-prepay',
        category: 'cashflow',
        title: 'Annual Upfront Pre-Payment & Cash Acceleration',
        priority: 'critical',
        impactEstimation: `Immediate ${sym}${Math.round(totalRev * 0.22).toLocaleString()} Cash Inflow`,
        description: 'Offering a 15-20% discount for customers paying 12 months upfront dramatically compresses your cash conversion cycle, provides immediate non-dilutive working capital, and cuts customer churn in half.',
        actionItems: [
          'Incentivize annual commitments with 2 months free or premium onboarding',
          'Shift default pricing page toggle from "Monthly" to "Annual (Billed Yearly)"',
          'Implement automated credit card expiration warning sequences to prevent involuntary churn',
        ],
      });

      strategicLevers.push({
        id: 'saas-expansion-mrr',
        category: 'revenue',
        title: 'Usage-Based Expansion & Value Metrics',
        priority: 'high',
        impactEstimation: '+20% Net Revenue Retention (NRR)',
        description: `Monetize power users by aligning price with customer value generation (e.g. seats, API calls, active records, volume tiering) rather than flat subscriptions.`,
        actionItems: [
          'Establish overage tiers or seat-based billing tiers to capture enterprise scale',
          'Identify top 15% accounts with high utilization and present enterprise SLA upgrades',
          'Introduce self-serve add-on modules for advanced reporting and workflow automations',
        ],
      });

      strategicLevers.push({
        id: 'saas-cloud-efficiency',
        category: 'margin',
        title: `Optimize Infrastructure & Tooling (${topExpenseCategory})`,
        priority: 'medium',
        impactEstimation: `+${sym}${Math.round(totalExp * 0.09).toLocaleString()} Margin Gain`,
        description: `SaaS margins should exceed 75%. Rationalizing unused internal SaaS seats, third-party APIs, and cloud compute reserved instances yields perpetual margin expansion.`,
        actionItems: [
          'Conduct SaaS license audit to cancel inactive software licenses across team',
          'Switch variable cloud compute instances to 1-year reserved instances for 30-40% discount',
          'Audit database query caching to reduce server compute load',
        ],
      });
      break;

    case 'services':
      strategicLevers.push({
        id: 'serv-retainer-transition',
        category: 'revenue',
        title: 'Transition Project Engagements to Monthly Advisory Retainers',
        priority: 'critical',
        impactEstimation: `+${sym}${Math.round(totalRev * 0.25).toLocaleString()} Predictable ARR`,
        description: 'Stop the feast-or-famine agency cashflow cycle. Package ongoing maintenance, monthly optimization, and strategic advisory into recurring monthly retainers.',
        actionItems: [
          'Require 3-month or 6-month minimum retainer agreements for new client engagements',
          'Present completed project deliverables with a standard "Ongoing Evolution Retainer" proposal',
          'Automate monthly ACH / recurring credit card billing on day 1 of each month',
        ],
      });

      strategicLevers.push({
        id: 'serv-value-pricing',
        category: 'margin',
        title: 'Value-Based Pricing & Scope Protection',
        priority: 'high',
        impactEstimation: '+15% Realized Hourly Margin',
        description: `Hourly billing penalizes efficiency. Adopting tiered value-based fixed deliverables with strict change-order policies protects ${topExpenseCategory} labor overhead.`,
        actionItems: [
          'Implement formal change order contracts for any client request outside agreed scope',
          'Increase baseline quote rates by 15% for all upcoming client proposals',
          'Package your proprietary methodology into standardized, repeatable delivery blueprints',
        ],
      });

      strategicLevers.push({
        id: 'serv-utilization-audit',
        category: 'cashflow',
        title: 'Shorten Payment Terms & Collect 50% Deposits',
        priority: 'medium',
        impactEstimation: 'Eliminate Days Sales Outstanding (DSO) Lag',
        description: 'Do not finance client projects out of your working capital. Require a 50% deposit before kickoff and net-7 payment milestone terms.',
        actionItems: [
          'Standardize 50% upfront deposit on contract signature before booking team capacity',
          'Shorten standard payment terms from Net-30 to Net-7 or milestone-based draws',
          'Institute a 2.5% late fee on invoices past 15 days overdue',
        ],
      });
      break;

    case 'manufacturing':
      strategicLevers.push({
        id: 'mfg-moq-tiering',
        category: 'margin',
        title: 'Minimum Order Quantity (MOQ) & Batch Optimization',
        priority: 'critical',
        impactEstimation: `+${sym}${Math.round(totalExp * 0.08).toLocaleString()} Production Efficiency`,
        description: 'Short production runs and custom small batches erode gross margin. Establish tiered MOQ structures that enforce profitability per machine run.',
        actionItems: [
          'Audit setup labor and machine changeover time across product lines',
          'Establish minimum order price floors preventing sub-margin batch production',
          'Provide discount incentives for customers placing quarterly scheduled orders',
        ],
      });

      strategicLevers.push({
        id: 'mfg-vendor-discounting',
        category: 'cashflow',
        title: `Raw Materials & Supplier Term Renegotiation (${topExpenseCategory})`,
        priority: 'high',
        impactEstimation: `Conserve ${sym}${Math.round(totalExp * 0.06).toLocaleString()} Working Capital`,
        description: `Suppliers and raw materials represent the largest capital sink. Negotiating 2/10 Net-45 supplier terms or consignment inventory preserves operating reserves.`,
        actionItems: [
          'Request competitive bids from secondary suppliers for top 3 raw materials',
          'Negotiate Net-45 or Net-60 credit terms on raw material purchases',
          'Liquidate slow-moving obsolete inventory to free warehouse square footage and cash',
        ],
      });

      strategicLevers.push({
        id: 'mfg-channel-direct',
        category: 'revenue',
        title: 'Wholesale B2B Direct Ordering Portal',
        priority: 'medium',
        impactEstimation: '+10% Gross Margin Lift',
        description: 'Bypass intermediary broker and distributor cuts by allowing retail partners to reorder directly via an automated B2B self-service wholesale portal.',
        actionItems: [
          'Launch private wholesale catalog for pre-approved retailer accounts',
          'Automate inventory availability notifications for repeat distributor accounts',
          'Standardize automated EDI or CSV invoice ingestion for wholesale partners',
        ],
      });
      break;

    case 'hospitality':
      strategicLevers.push({
        id: 'hosp-menu-engineering',
        category: 'margin',
        title: 'Contribution Margin Menu Re-Engineering',
        priority: 'critical',
        impactEstimation: `+${(marginPct + 4.5).toFixed(1)}% Contribution Margin`,
        description: 'Classify menu offerings into Stars (High Profit, High Volume) and Dogs (Low Profit, Low Volume). Eliminate or reprice low-margin items that tie up prep prep labor.',
        actionItems: [
          'Calculate exact ingredient plate cost for top 10 revenue-generating dishes',
          'Reposition highest margin items in the prime upper-right quadrant of menu layouts',
          'Phase out or substitute ingredients for recipes with volatile commodity pricing',
        ],
      });

      strategicLevers.push({
        id: 'hosp-direct-ordering',
        category: 'revenue',
        title: 'Direct Ordering to Bypass Aggregator Commissions',
        priority: 'high',
        impactEstimation: `Save 18-30% Commissions (${sym}${Math.round(totalRev * 0.07).toLocaleString()})`,
        description: 'Third-party delivery platforms take 20-30% of order totals. Incentivize diners to order direct with exclusive rewards and first-order credits.',
        actionItems: [
          'Insert branded "Order Direct & Save 10%" flyers in all takeout and delivery bags',
          'Set up direct commission-free online ordering integrated with your POS',
          'Collect customer mobile numbers for weekly VIP specials during slow weekdays',
        ],
      });

      strategicLevers.push({
        id: 'hosp-shift-scheduling',
        category: 'cashflow',
        title: `Align Labor Costs to Peak Revenue Windows (${topExpenseCategory})`,
        priority: 'medium',
        impactEstimation: 'Prevent Idle Shift Overhead',
        description: 'Labor is your largest controllable variable cost. Align staff scheduling dynamically against hourly transaction volume patterns.',
        actionItems: [
          'Cross-reference hourly POS transaction reports with staff timesheets',
          'Implement on-call staggered shift start times rather than block scheduling',
          'Audit food waste logs at end of each shift to identify batch over-preparation',
        ],
      });
      break;

    case 'healthcare':
      strategicLevers.push({
        id: 'hlth-no-show-reduction',
        category: 'revenue',
        title: 'Multi-Channel Automated Appointment Confirmation Engine',
        priority: 'critical',
        impactEstimation: `Recover ${sym}${Math.round(totalRev * 0.10).toLocaleString()} Lost Capacity`,
        description: 'Patient no-shows and last-minute cancellations permanently burn practitioner billable hours. Automated 48h and 2h SMS confirmations slash missed appointments by 60%.',
        actionItems: [
          'Deploy automated 2-way SMS appointment confirmation and reschedule workflows',
          'Maintain a proactive "short-notice standby list" to instantly backfill canceled slots',
          'Implement a 24-hour cancellation card-on-file reservation policy',
        ],
      });

      strategicLevers.push({
        id: 'hlth-elective-wellness',
        category: 'margin',
        title: 'High-Margin Elective Services & Care Packages',
        priority: 'high',
        impactEstimation: '+25% Average Revenue Per Patient',
        description: 'Insurance reimbursements face constant downward pressure. Introducing cash-pay preventative screenings, wellness add-ons, and bundled therapy passes expands net margin.',
        actionItems: [
          'Bundle preventative diagnostics and quarterly wellness follow-ups into memberships',
          'Train front-desk staff to present complementary patient care enhancements',
          'Provide clear transparent self-pay package pricing for high-demand wellness treatments',
        ],
      });

      strategicLevers.push({
        id: 'hlth-claims-denial-audit',
        category: 'cashflow',
        title: 'Billing Cycle Velocity & Denial Recovery',
        priority: 'medium',
        impactEstimation: 'Accelerate Cash Collection by 21 Days',
        description: `Clean insurance claim submission prevents reimbursement holds in "${topExpenseCategory}". Auditing coding errors eliminates delayed cashflow.`,
        actionItems: [
          'Conduct weekly claims scrub to resolve rejections within 72 hours of filing',
          'Verify patient eligibility and co-pay collection prior to service delivery',
          'Enable online patient payment portals for instant post-insurance balance settlement',
        ],
      });
      break;

    default: // General Business
      strategicLevers.push({
        id: 'gen-80-20-pricing',
        category: 'revenue',
        title: '80/20 Account Pareto & Selective 7-10% Price Adjustment',
        priority: 'critical',
        impactEstimation: `Direct +${sym}${Math.round(totalRev * 0.08).toLocaleString()} Profit Lift`,
        description: `Most businesses underprice due to inflation inertia. A targeted 8% price adjustment on your top revenue line "${topRevenueCategory}" drops straight to operating profit with minimal churn.`,
        actionItems: [
          `Analyze transaction margins across accounts to identify the top 20% driver segments`,
          `Implement a 7-9% pricing adjustment for all upcoming customer renewals and new contracts`,
          'Grandfather high-volume strategic accounts in exchange for guaranteed volume commitments',
        ],
      });

      strategicLevers.push({
        id: 'gen-cost-rationalization',
        category: 'margin',
        title: `Strategic Rationalization of "${topExpenseCategory}"`,
        priority: 'high',
        impactEstimation: `Save ${sym}${Math.round(topExpenseAmount * 0.10 || totalExp * 0.07).toLocaleString()} Annually`,
        description: `Operating expenses in "${topExpenseCategory}" represent your single largest capital commitment (${sym}${topExpenseAmount.toLocaleString()}). Bidding contracts with alternative suppliers secures immediate savings.`,
        actionItems: [
          `Request 3 competing vendor bids for services in "${topExpenseCategory}"`,
          'Eliminate overlapping software tools, subscriptions, and duplicate service retainers',
          'Enforce pre-approval expense thresholds for any department spend exceeding $1,000',
        ],
      });

      strategicLevers.push({
        id: 'gen-cashflow-buffer',
        category: 'cashflow',
        title: 'Establish 90-Day Operating Reserve Buffer',
        priority: 'medium',
        impactEstimation: 'Shield Against Downside Volatility',
        description: 'Maintain a minimum 3-month operating reserve to withstand macroeconomic contraction, payroll fluctuations, and delayed customer payments.',
        actionItems: [
          `Allocate 15% of monthly net profit into a dedicated high-yield operating liquidity reserve`,
          'Automate receivables aging alerts at 15, 30, and 45 days past due',
          'Establish a pre-approved commercial line of credit while financials are strong',
        ],
      });
      break;
  }

  // Add Priority-Specific Bonus Lever
  if (context.growthPriority === 'retention' && !strategicLevers.some(l => l.category === 'retention')) {
    strategicLevers.push({
      id: 'priority-churn-mitigation',
      category: 'retention',
      title: 'Proactive Customer Churn Prevention & Health Scoring',
      priority: 'high',
      impactEstimation: '+18% Customer Lifetime Value',
      description: 'Retaining existing customers is 5x cheaper than new acquisition. Track customer activity drop-offs and deploy automated executive check-ins before accounts lapse.',
      actionItems: [
        'Identify dormant customer accounts with no purchases in 60+ days and send a reactivation offer',
        'Conduct quarterly business review check-ins for top 15% revenue generating accounts',
        'Survey churned or lapsed clients to uncover root friction points in your service delivery',
      ],
    });
  }

  // 6. Actionable 30-60-90 Day Execution Roadmap
  const roadmap: GrowthRoadmapPhase[] = [
    {
      phase: '30-days',
      title: 'Immediate Quick Wins & Financial Leak Plugging',
      focus: 'Stopping margin leakage and securing rapid cashflow gains',
      milestones: [
        `Audit "${topExpenseCategory}" accounts to eliminate redundant subscriptions and trim 5-8%`,
        'Enforce updated pricing on all upcoming customer renewals, contracts, or checkout items',
        'Review and accelerate all overdue receivables past 15 days to collect outstanding cash',
      ],
    },
    {
      phase: '60-days',
      title: 'High-Yield Optimization & Channel Expansion',
      focus: 'Deploying targeted growth levers and packaging premium tiers',
      milestones: [
        `Launch bundled offerings or retainer agreements around "${topRevenueCategory}"`,
        'Implement automated customer reactivation / abandoned order recovery sequences',
        'Renegotiate supplier payment terms (Net-45/60) to expand operational working capital',
      ],
    },
    {
      phase: '90-days',
      title: 'Institutionalize Systems, Moat & Sustainable Scale',
      focus: 'Solidifying repeatable unit economics and scaling acquisition',
      milestones: [
        `Reinvest incremental profit into high-ROI customer acquisition channels`,
        'Establish automated monthly executive financial reviews to track KPI variance',
        'Build a dedicated 90-day operating cash buffer to ensure perpetual solvency',
      ],
    },
  ];

  // 7. Industry Benchmarking Comparison
  const benchmarks: GrowthBenchmark[] = [
    {
      metric: 'Net Operating Margin',
      yourValue: `${marginPct.toFixed(1)}%`,
      industryAverage: context.businessType === 'saas' ? '22.0%' : context.businessType === 'ecommerce' ? '12.5%' : context.businessType === 'services' ? '18.0%' : '14.0%',
      status: marginPct >= 16 ? 'above' : marginPct >= 8 ? 'on-par' : 'below',
    },
    {
      metric: 'Expense-to-Revenue Ratio',
      yourValue: `${expenseRatio.toFixed(1)}%`,
      industryAverage: context.businessType === 'saas' ? '75.0%' : '82.0%',
      status: expenseRatio <= 75 ? 'above' : expenseRatio <= 86 ? 'on-par' : 'below',
    },
    {
      metric: 'Revenue Concentration',
      yourValue: `${revenueConcentration.toFixed(0)}% in Top Category`,
      industryAverage: '< 40.0%',
      status: revenueConcentration <= 40 ? 'above' : revenueConcentration <= 65 ? 'on-par' : 'below',
    },
    {
      metric: 'Average Order / Ticket Size',
      yourValue: `${sym}${avgTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      industryAverage: `${sym}${Math.round(avgTicket * 1.15).toLocaleString()}`,
      status: avgTicket > 0 ? 'on-par' : 'below',
    },
  ];

  // 8. Executive Growth Summary Text
  const typeLabel = BUSINESS_TYPE_LABELS[context.businessType]?.name || 'Business';
  const growthSummary = `Based on your ${typeLabel} profile (${context.businessStage} stage) and analyzed financials, your business holds a ${readinessTier} growth posture with ${sym}${projectedRevenueUpsideAmount.toLocaleString()} in projected revenue upside. Your primary opportunity is ${primaryBottleneck.toLowerCase()}, which can unlock an estimated +${sym}${projectedProfitLiftAmount.toLocaleString()} in annual net profit expansion.`;

  return {
    context,
    growthReadinessScore: score,
    readinessTier,
    projectedRevenueUpsidePercent,
    projectedRevenueUpsideAmount,
    projectedMarginLiftPercent,
    projectedProfitLiftAmount,
    primaryBottleneck,
    growthSummary,
    strategicLevers,
    roadmap,
    benchmarks,
  };
}

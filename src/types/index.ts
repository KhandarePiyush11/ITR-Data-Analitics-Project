/**
 * FinPulse Business Financial Analyzer
 * Universal Data Contracts & Domain Model Definitions
 * 
 * @module types
 * @author Senior Data Architect & Principal Engineer
 */

// ============================================================================
// Core Data Types & Ingestion Schema
// ============================================================================

/** Supported primitive data types inferred by the analysis engine */
export type InferredDataType = 
  | 'numeric'
  | 'currency'
  | 'date'
  | 'boolean'
  | 'categorical'
  | 'text'
  | 'id';

/** Semantic domain roles detected across financial and business ledgers */
export type SemanticRole = 
  | 'timestamp'
  | 'revenue'
  | 'expense'
  | 'profit'
  | 'tax'
  | 'entity_id'
  | 'category'
  | 'description'
  | 'quantity'
  | 'rate'
  | 'unknown';

/** Supported input file format extensions */
export type SupportedFileType = 
  | 'csv'
  | 'tsv'
  | 'xlsx'
  | 'xls'
  | 'json'
  | 'ndjson'
  | 'xml'
  | 'yaml'
  | 'html'
  | 'txt'
  | 'unknown';

/** Metadata collected during ingestion */
export interface IngestionMetadata {
  filename: string;
  fileSizeBytes: number;
  totalRows: number;
  totalColumns: number;
  detectedType: SupportedFileType;
  encoding?: string;
  delimiter?: string;
  sheetNames?: string[];
  activeSheet?: string;
  executionTimeMs: number;
}

/** Standardized raw tabular dataset structure */
export interface UnifiedDataset {
  headers: string[];
  rows: Record<string, any>[];
  metadata: IngestionMetadata;
}

// ============================================================================
// Column Profiling & Statistical Summaries
// ============================================================================

/** Statistical metrics for numeric and currency fields */
export interface NumericProfile {
  min: number;
  max: number;
  mean: number;
  median: number;
  sum: number;
  variance: number;
  stdDev: number;
  nullCount: number;
  zeroCount: number;
  negativeCount: number;
  currencySymbol?: string;
}

/** Statistical metrics for categorical and discrete string fields */
export interface CategoricalProfile {
  uniqueCount: number;
  topValues: Array<{ value: string; count: number; percentage: number }>;
  nullCount: number;
  cardinalityRatio: number; // uniqueCount / totalRows
}

/** Statistical metrics for temporal date fields */
export interface DateProfile {
  earliestDate: string;
  latestDate: string;
  timespanDays: number;
  hasTimeComponent: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'irregular';
  nullCount: number;
}

/** Complete semantic and statistical profile for a single column */
export interface ColumnProfile {
  name: string;
  index: number;
  inferredType: InferredDataType;
  typeConfidence: number; // 0.0 to 1.0
  semanticRole: SemanticRole;
  roleConfidence: number; // 0.0 to 1.0
  nullCount: number;
  nullPercentage: number;
  numericStats?: NumericProfile;
  categoricalStats?: CategoricalProfile;
  dateStats?: DateProfile;
  sampleValues: any[];
}

// ============================================================================
// Dataset-Level Financial & Analytical Intelligence
// ============================================================================

/** Financial KPIs auto-extracted from detected ledger columns */
export interface FinancialKpiSummary {
  hasFinancialMetrics: boolean;
  currencySymbol: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  totalTax: number;
  effectiveTaxRatePercent: number;
  transactionCount: number;
  profitableTransactionsCount: number;
  lossTransactionsCount: number;
  averageTransactionValue: number;
  revenueColumn?: string;
  expenseColumn?: string;
  profitColumn?: string;
  taxColumn?: string;
  dateColumn?: string;
  categoryColumn?: string;
  typeColumn?: string;
}

/** User-defined column mapping overrides */
export interface ColumnMappingOverrides {
  dateColumn?: string;
  revenueColumn?: string;
  expenseColumn?: string;
  profitColumn?: string;
  taxColumn?: string;
  categoryColumn?: string;
  typeColumn?: string;
  currencySymbol?: string;
}

/** Strategic business health evaluation & grade */
export interface HealthScorecard {
  overallScore: number; // 0 to 100
  letterGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  verdict: string;
  metrics: {
    marginGrade: string;
    expenseEfficiencyRatio: number;
    cashGenerationRatio: number;
    winRate: number;
  };
  actionableInsights: Array<{
    id: string;
    type: 'optimization' | 'risk_warning' | 'growth_opportunity' | 'tax_saving';
    title: string;
    impactEstimation: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

/** Complete analyzed outcome produced by the DataAnalyzer */
export interface DatasetAnalysisResult {
  dataset: UnifiedDataset;
  columns: Record<string, ColumnProfile>;
  columnList: ColumnProfile[];
  financialKpis: FinancialKpiSummary;
  healthScorecard: HealthScorecard;
  recommendedCharts: ChartRecommendation[];
}

// ============================================================================
// Adaptive Visualization Contracts
// ============================================================================

/** Supported chart visualization types in the dynamic renderer */
export type ChartType = 
  | 'line'
  | 'area'
  | 'bar'
  | 'stacked_bar'
  | 'donut'
  | 'pie'
  | 'scatter'
  | 'radial'
  | 'heatmap';

/** Available mathematical aggregations for chart metrics */
export type AggregationFunction = 'sum' | 'mean' | 'count' | 'min' | 'max';

/** Recommended chart configuration metadata */
export interface ChartRecommendation {
  id: string;
  title: string;
  description: string;
  chartType: ChartType;
  confidenceScore: number;
  dimensionKey: string;     // Column used for X-Axis / Categories
  metricKeys: string[];      // Columns used for Values / Series
  aggregation: AggregationFunction;
  dateGranularity?: 'day' | 'month' | 'quarter' | 'year';
  groupKey?: string;         // Secondary grouping column
  showTrendline?: boolean;
}

/** User active chart configuration */
export interface ActiveChartConfig {
  id: string;
  title: string;
  chartType: ChartType;
  dimensionKey: string;
  metricKeys: string[];
  aggregation: AggregationFunction;
  dateGranularity?: 'day' | 'month' | 'quarter' | 'year';
  isCumulative?: boolean;
  showTrendline?: boolean;
}

// ============================================================================
// Future Business Growth & Strategic Suggestion Contracts
// ============================================================================

export type BusinessType = 
  | 'ecommerce'
  | 'saas'
  | 'services'
  | 'manufacturing'
  | 'hospitality'
  | 'healthcare'
  | 'general';

export type GrowthPriority = 
  | 'revenue'
  | 'margin'
  | 'cashflow'
  | 'retention';

export type BusinessStage = 
  | 'early'
  | 'growth'
  | 'enterprise';

export interface BusinessContext {
  businessType: BusinessType;
  growthPriority: GrowthPriority;
  businessStage: BusinessStage;
}

export interface GrowthStrategicLever {
  id: string;
  category: 'revenue' | 'margin' | 'cashflow' | 'retention';
  title: string;
  priority: 'critical' | 'high' | 'medium';
  impactEstimation: string;
  potentialLiftAmount?: number;
  description: string;
  actionItems: string[];
}

export interface GrowthRoadmapPhase {
  phase: '30-days' | '60-days' | '90-days';
  title: string;
  focus: string;
  milestones: string[];
}

export interface GrowthBenchmark {
  metric: string;
  yourValue: string;
  industryAverage: string;
  status: 'above' | 'on-par' | 'below';
}

export interface GrowthSuggestionAnalysis {
  context: BusinessContext;
  growthReadinessScore: number;
  readinessTier: 'Accelerated' | 'Strong' | 'Needs Optimization' | 'Turnaround Required';
  projectedRevenueUpsidePercent: number;
  projectedRevenueUpsideAmount: number;
  projectedMarginLiftPercent: number;
  projectedProfitLiftAmount: number;
  primaryBottleneck: string;
  growthSummary: string;
  strategicLevers: GrowthStrategicLever[];
  roadmap: GrowthRoadmapPhase[];
  benchmarks: GrowthBenchmark[];
}


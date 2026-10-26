/**
 * FinPulse Business Financial Analyzer
 * Statistical Profiling Engine
 * 
 * @module analyzer/statisticalProfiler
 */

import { 
  NumericProfile, 
  CategoricalProfile, 
  DateProfile, 
  InferredDataType 
} from '../types';
import { cleanNumericValue, parseDateCandidate, extractCurrencySymbol } from './typeInference';

/**
 * Computes descriptive statistics for a numeric or currency column
 */
export function profileNumericColumn(values: any[]): NumericProfile {
  let nullCount = 0;
  let zeroCount = 0;
  let negativeCount = 0;
  let sum = 0;
  const numbers: number[] = [];
  let detectedSymbol = '$';

  for (const v of values) {
    if (v === null || v === undefined || String(v).trim() === '') {
      nullCount++;
      continue;
    }

    const sym = extractCurrencySymbol(v);
    if (sym) detectedSymbol = sym;

    const num = cleanNumericValue(v);
    if (isNaN(num)) {
      nullCount++;
    } else {
      numbers.push(num);
      sum += num;
      if (num === 0) zeroCount++;
      if (num < 0) negativeCount++;
    }
  }

  if (numbers.length === 0) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      sum: 0,
      variance: 0,
      stdDev: 0,
      nullCount,
      zeroCount: 0,
      negativeCount: 0,
      currencySymbol: detectedSymbol,
    };
  }

  numbers.sort((a, b) => a - b);

  const min = numbers[0];
  const max = numbers[numbers.length - 1];
  const mean = sum / numbers.length;

  // Calculate Median
  const mid = Math.floor(numbers.length / 2);
  const median = numbers.length % 2 !== 0 
    ? numbers[mid] 
    : (numbers[mid - 1] + numbers[mid]) / 2;

  // Calculate Variance and Standard Deviation
  const varianceSum = numbers.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0);
  const variance = varianceSum / numbers.length;
  const stdDev = Math.sqrt(variance);

  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    sum: Math.round(sum * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    nullCount,
    zeroCount,
    negativeCount,
    currencySymbol: detectedSymbol,
  };
}

/**
 * Computes frequency distributions and cardinality for categorical columns
 */
export function profileCategoricalColumn(values: any[]): CategoricalProfile {
  let nullCount = 0;
  const counts = new Map<string, number>();

  for (const v of values) {
    if (v === null || v === undefined || String(v).trim() === '') {
      nullCount++;
      continue;
    }
    const str = String(v).trim();
    counts.set(str, (counts.get(str) || 0) + 1);
  }

  const totalValid = values.length - nullCount;
  const uniqueCount = counts.size;
  const cardinalityRatio = totalValid > 0 ? uniqueCount / totalValid : 0;

  // Compile top 10 most frequent items
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([value, count]) => ({
      value,
      count,
      percentage: totalValid > 0 ? Math.round((count / totalValid) * 1000) / 10 : 0,
    }));

  return {
    uniqueCount,
    topValues: sorted,
    nullCount,
    cardinalityRatio: Math.round(cardinalityRatio * 1000) / 1000,
  };
}

/**
 * Computes temporal distribution and range for date columns
 */
export function profileDateColumn(values: any[]): DateProfile {
  let nullCount = 0;
  const timestamps: number[] = [];

  for (const v of values) {
    const d = parseDateCandidate(v);
    if (d) {
      timestamps.push(d.getTime());
    } else {
      nullCount++;
    }
  }

  if (timestamps.length === 0) {
    return {
      earliestDate: 'N/A',
      latestDate: 'N/A',
      timespanDays: 0,
      hasTimeComponent: false,
      frequency: 'irregular',
      nullCount,
    };
  }

  timestamps.sort((a, b) => a - b);
  const minTime = timestamps[0];
  const maxTime = timestamps[timestamps.length - 1];
  const timespanDays = Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24));

  // Infer temporal frequency by average interval
  let frequency: DateProfile['frequency'] = 'irregular';
  if (timestamps.length > 2) {
    const avgGapDays = timespanDays / (timestamps.length - 1);
    if (avgGapDays <= 1.5) frequency = 'daily';
    else if (avgGapDays >= 6 && avgGapDays <= 8) frequency = 'weekly';
    else if (avgGapDays >= 25 && avgGapDays <= 35) frequency = 'monthly';
    else if (avgGapDays >= 80 && avgGapDays <= 100) frequency = 'quarterly';
    else if (avgGapDays >= 350 && avgGapDays <= 380) frequency = 'yearly';
  }

  return {
    earliestDate: new Date(minTime).toISOString().split('T')[0],
    latestDate: new Date(maxTime).toISOString().split('T')[0],
    timespanDays,
    hasTimeComponent: false,
    frequency,
    nullCount,
  };
}

/**
 * Orchestrates statistical profiling based on the inferred data type
 */
export function generateColumnStats(
  values: any[],
  type: InferredDataType
): {
  numericStats?: NumericProfile;
  categoricalStats?: CategoricalProfile;
  dateStats?: DateProfile;
} {
  switch (type) {
    case 'numeric':
    case 'currency':
      return { numericStats: profileNumericColumn(values) };

    case 'date':
      return { dateStats: profileDateColumn(values) };

    case 'categorical':
    case 'boolean':
    case 'text':
    case 'id':
    default:
      return { categoricalStats: profileCategoricalColumn(values) };
  }
}

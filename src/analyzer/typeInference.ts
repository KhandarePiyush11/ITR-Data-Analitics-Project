/**
 * FinPulse Business Financial Analyzer
 * Granular Data Type Inference & String Sanitization Engine
 * 
 * @module analyzer/typeInference
 */

import { InferredDataType } from '../types';

/** Regex for stripping currency characters and formatting whitespace */
const CURRENCY_SYMBOLS_REGEX = /[$€£₹¥₩]/g;

/** Common boolean string values */
const BOOLEAN_TRUE = new Set(['true', 'yes', 'y', '1', 't']);
const BOOLEAN_FALSE = new Set(['false', 'no', 'n', '0', 'f']);

/**
 * Sanitizes dirty raw string numbers (e.g. "$1,234.50", "€ 450", "(2,500.00)", "15.4%")
 * into a valid JavaScript floating point number.
 * 
 * @param val Any input value
 * @returns Clean numeric float or NaN if unparseable
 */
export function cleanNumericValue(val: any): number {
  if (typeof val === 'number') {
    return isNaN(val) ? NaN : val;
  }
  if (val === null || val === undefined) return NaN;

  let str = String(val).trim();
  if (!str) return NaN;

  // Handle accounting negative format: (1,234.50) -> -1234.50
  let isNegative = false;
  if (/^\(.*\)$/.test(str)) {
    isNegative = true;
    str = str.slice(1, -1).trim();
  } else if (str.startsWith('-')) {
    isNegative = true;
    str = str.slice(1).trim();
  }

  // Remove currency symbols, commas, percent, and spaces
  str = str.replace(CURRENCY_SYMBOLS_REGEX, '').replace(/,/g, '').replace(/%/g, '').trim();

  const num = parseFloat(str);
  if (isNaN(num)) return NaN;

  return isNegative ? -num : num;
}

/**
 * Detects currency symbol present in a string value
 */
export function extractCurrencySymbol(val: any): string | null {
  if (typeof val !== 'string') return null;
  const match = val.match(CURRENCY_SYMBOLS_REGEX);
  return match ? match[0] : null;
}

/**
 * Tests if a value is a valid date representation
 */
export function parseDateCandidate(val: any): Date | null {
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (!val || typeof val === 'boolean') return null;

  const str = String(val).trim();
  // Reject pure numbers with length not 8 or 10 or 13 (to prevent numbers like 1000 from becoming 1970 dates)
  if (/^\d+$/.test(str)) {
    if (str.length === 13) {
      // Millisecond timestamp
      const d = new Date(Number(str));
      return isNaN(d.getTime()) ? null : d;
    }
    if (str.length === 10) {
      // Second timestamp (e.g. 1705276800)
      const d = new Date(Number(str) * 1000);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  // Must contain date delimiters (-, /, .) or month abbreviation
  if (!/[-/.]/.test(str) && !/[a-zA-Z]{3,}/.test(str)) {
    return null;
  }

  // Handle DD.MM.YYYY or DD/MM/YYYY or MM/DD/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dmyMatch) {
    const p1 = Number(dmyMatch[1]);
    const p2 = Number(dmyMatch[2]);
    const yr = Number(dmyMatch[3]);
    if (yr > 1950 && yr < 2100) {
      if (p1 > 12 && p2 <= 12) {
        // Definitely DD-MM-YYYY
        const d = new Date(yr, p2 - 1, p1);
        if (!isNaN(d.getTime())) return d;
      } else if (p2 > 12 && p1 <= 12) {
        // Definitely MM-DD-YYYY
        const d = new Date(yr, p1 - 1, p2);
        if (!isNaN(d.getTime())) return d;
      } else if (p1 <= 12 && p2 <= 12) {
        // Ambiguous (e.g. 05/06/2024), default to standard
        const d = new Date(str);
        if (!isNaN(d.getTime())) return d;
      }
    }
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1950 && parsed.getFullYear() < 2100) {
    return parsed;
  }

  return null;
}

/**
 * Infer the high-confidence primitive data type for an array of sample column values
 * 
 * @param sampleValues Array of non-null sample string/number values
 * @param columnName Column header name used for secondary heuristic hints
 * @returns { inferredType: InferredDataType, confidence: number }
 */
export function inferColumnType(
  sampleValues: any[], 
  columnName = ''
): { inferredType: InferredDataType; confidence: number } {
  const nonNulls = sampleValues.filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== ''
  );

  if (nonNulls.length === 0) {
    return { inferredType: 'text', confidence: 0.1 };
  }

  const total = nonNulls.length;
  let currencyCount = 0;
  let numericCount = 0;
  let dateCount = 0;
  let booleanCount = 0;

  for (const v of nonNulls) {
    const str = String(v).trim().toLowerCase();

    // Check currency
    if (extractCurrencySymbol(v) !== null) {
      currencyCount++;
    }

    // Check numeric
    const cleanNum = cleanNumericValue(v);
    if (!isNaN(cleanNum)) {
      numericCount++;
    }

    // Check date
    if (parseDateCandidate(v) !== null) {
      dateCount++;
    }

    // Check boolean
    if (BOOLEAN_TRUE.has(str) || BOOLEAN_FALSE.has(str)) {
      booleanCount++;
    }
  }

  // 1. Currency (strongest financial signal)
  if (currencyCount / total >= 0.5) {
    return { inferredType: 'currency', confidence: currencyCount / total };
  }

  // 2. Date
  if (dateCount / total >= 0.7) {
    return { inferredType: 'date', confidence: dateCount / total };
  }

  // 3. Boolean
  if (booleanCount / total >= 0.85) {
    return { inferredType: 'boolean', confidence: booleanCount / total };
  }

  // 4. Numeric
  if (numericCount / total >= 0.8) {
    // Check if column name indicates an identifier or code rather than continuous numeric
    const lowerName = columnName.toLowerCase();
    if (/(^id$|_id$|uuid|code|isbn|sku|ssn|ein|zip|postal|phone)/.test(lowerName)) {
      return { inferredType: 'id', confidence: 0.85 };
    }
    return { inferredType: 'numeric', confidence: numericCount / total };
  }

  // 5. Categorical vs General Text / ID
  const uniqueSet = new Set(nonNulls.map((v) => String(v).trim().toLowerCase()));
  const cardinalityRatio = uniqueSet.size / total;

  // If low cardinality (e.g. repetitive departments, statuses, categories)
  if (cardinalityRatio <= 0.4 || uniqueSet.size <= 30) {
    return { inferredType: 'categorical', confidence: 0.8 };
  }

  // Check ID patterns in string
  const lowerName = columnName.toLowerCase();
  if (/(^id$|_id$|uuid|hash|ref|reference|sku|account_num)/.test(lowerName)) {
    return { inferredType: 'id', confidence: 0.9 };
  }

  return { inferredType: 'text', confidence: 0.7 };
}

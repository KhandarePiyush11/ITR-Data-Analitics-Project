/**
 * Formatting utilities for currency, numbers, dates, and percentages.
 */

/**
 * Format a number as currency with proper sign and symbol.
 * @param {number} value
 * @param {string} [symbol='$']
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function formatCurrency(value, symbol = '$', decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return `${symbol}0.00`;
  }
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  
  const formattedNumber = absValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return isNegative ? `-${symbol}${formattedNumber}` : `${symbol}${formattedNumber}`;
}

/**
 * Compact currency for chart axes (e.g. $12.5k, $1.2M)
 * @param {number} value
 * @param {string} [symbol='$']
 * @returns {string}
 */
export function formatCompactCurrency(value, symbol = '$') {
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
    formatted = absVal.toFixed(0);
  }

  // Remove trailing .0
  formatted = formatted.replace(/\.0([BMk])/, '$1');

  return isNegative ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

/**
 * Format a decimal/percentage.
 * @param {number} value e.g. 15.42 or 0.1542
 * @param {boolean} [alreadyPercent=true]
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercentage(value, alreadyPercent = true, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  const num = alreadyPercent ? value : value * 100;
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
}

/**
 * Format raw number with commas.
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return Number(value).toLocaleString('en-US');
}

/**
 * Standardize and format a date string or timestamp.
 * @param {string|Date} dateVal
 * @returns {string}
 */
export function formatDate(dateVal) {
  if (!dateVal) return 'N/A';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) {
      return String(dateVal);
    }
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(dateVal);
  }
}

/**
 * Format date for chart X-axis labels (short month/year or month/day).
 * @param {string} dateStr
 * @returns {string}
 */
export function formatChartDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

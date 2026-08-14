import Papa from 'papaparse';

/**
 * Regex patterns for flexible column detection (case-insensitive)
 */
const PATTERNS = {
  date: /^(date|time|period|month|day|timestamp|year|trx_date|transaction_date|tx_date|invoice_date|payment_date)$/i,
  dateSubstring: /(date|time|period|month|day|timestamp)/i,
  
  revenue: /^(revenue|sales|income|earnings|gross|inflow|turnover|amount_received|credit|receipts|total_sales|gross_revenue|gross_sales)$/i,
  revenueSubstring: /(revenue|sales|income|earnings|gross|inflow|turnover|receipt)/i,
  
  expense: /^(expense|cost|payout|spending|outflow|expenditure|fees|purchase|debit|bills|total_expense|operating_cost|cogs)$/i,
  expenseSubstring: /(expense|cost|payout|spending|outflow|expenditure|fee|purchase|debit)/i,
  
  profit: /^(profit|net|margin|net_income|gain|net_profit|operating_profit|ebitda)$/i,
  profitSubstring: /(profit|net_income|margin|net_profit|gain)/i,
  
  category: /^(category|type|product|department|item|segment|group|class|service|account|industry|channel)$/i,
  categorySubstring: /(category|type|product|department|item|segment|group|channel|service)/i,

  description: /^(description|desc|notes|memo|details|name|title|client|customer|vendor|merchant)$/i,
  descriptionSubstring: /(description|notes|memo|detail|client|customer|vendor|merchant)/i,
};

/**
 * Clean a string into a valid floating point number.
 * Handles currencies ($1,234.56, €500, ₹10,000), accounting negatives (1,234.50), and whitespace.
 * @param {any} val
 * @returns {number}
 */
export function cleanNumber(val) {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }
  if (!val) return 0;
  
  let str = String(val).trim();
  if (!str) return 0;

  // Handle accounting format (1,200.50) -> -1200.50
  let isNegative = false;
  if (/^\(.*\)$/.test(str)) {
    isNegative = true;
    str = str.slice(1, -1);
  } else if (str.startsWith('-')) {
    isNegative = true;
    str = str.slice(1);
  }

  // Strip currency symbols, commas, spaces, letters (except e for scientific notation)
  str = str.replace(/[$€£₹¥₩,\s%]/g, '');

  const parsed = parseFloat(str);
  if (isNaN(parsed)) return 0;

  return isNegative ? -parsed : parsed;
}

/**
 * Detect currency symbol present in raw data sample
 * @param {Array<Object>} rows
 * @returns {string} detected symbol, default '$'
 */
export function detectCurrencySymbol(rows) {
  if (!rows || rows.length === 0) return '$';
  
  const sample = JSON.stringify(rows.slice(0, 30));
  if (sample.includes('₹')) return '₹';
  if (sample.includes('€')) return '€';
  if (sample.includes('£')) return '£';
  if (sample.includes('¥')) return '¥';
  if (sample.includes('$')) return '$';
  
  return '$';
}

/**
 * Match column names to standardized financial concepts
 * @param {Array<string>} headers
 * @returns {Object} { dateKey, revenueKey, expenseKey, profitKey, categoryKey, descriptionKey }
 */
export function detectColumnMappings(headers) {
  const mapping = {
    dateKey: null,
    revenueKey: null,
    expenseKey: null,
    profitKey: null,
    categoryKey: null,
    descriptionKey: null,
  };

  const usedHeaders = new Set();

  const findBestMatch = (exactPattern, substringPattern) => {
    // 1. Try exact regex match first
    for (const h of headers) {
      if (!usedHeaders.has(h) && exactPattern.test(h.trim())) {
        usedHeaders.add(h);
        return h;
      }
    }
    // 2. Try substring match second
    for (const h of headers) {
      if (!usedHeaders.has(h) && substringPattern.test(h.trim())) {
        usedHeaders.add(h);
        return h;
      }
    }
    return null;
  };

  mapping.profitKey = findBestMatch(PATTERNS.profit, PATTERNS.profitSubstring);
  mapping.revenueKey = findBestMatch(PATTERNS.revenue, PATTERNS.revenueSubstring);
  mapping.expenseKey = findBestMatch(PATTERNS.expense, PATTERNS.expenseSubstring);
  mapping.dateKey = findBestMatch(PATTERNS.date, PATTERNS.dateSubstring);
  mapping.categoryKey = findBestMatch(PATTERNS.category, PATTERNS.categorySubstring);
  mapping.descriptionKey = findBestMatch(PATTERNS.description, PATTERNS.descriptionSubstring);

  return mapping;
}

/**
 * Parse standard or ISO date strings to consistent YYYY-MM-DD or Month representation
 * @param {any} rawDate
 * @param {number} fallbackIndex
 * @returns {{ dateStr: string, monthKey: string, yearKey: string, quarterKey: string, timestamp: number }}
 */
function parseDateDetails(rawDate, fallbackIndex) {
  let d = null;
  if (rawDate) {
    // Try native Date parsing
    const parsed = new Date(rawDate);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    } else {
      // Try dd/mm/yyyy or mm/dd/yyyy or yyyy-mm-dd fallback
      const parts = String(rawDate).split(/[-/.]/);
      if (parts.length === 3) {
        // Assume yyyy-mm-dd or dd-mm-yyyy
        if (parts[0].length === 4) {
          d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else if (parts[2].length === 4) {
          d = new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
        }
      }
    }
  }

  if (!d || isNaN(d.getTime())) {
    // Fallback pseudo-date based on row index
    const now = new Date(2024, 0, 1);
    now.setDate(now.getDate() + fallbackIndex);
    d = now;
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const monthName = d.toLocaleString('en-US', { month: 'short' });
  const quarter = `Q${Math.floor(d.getMonth() / 3) + 1}`;

  return {
    dateStr: `${yyyy}-${mm}-${dd}`,
    monthKey: `${monthName} ${yyyy}`,
    monthSortKey: `${yyyy}-${mm}`,
    yearKey: `${yyyy}`,
    quarterKey: `${yyyy} ${quarter}`,
    timestamp: d.getTime(),
  };
}

/**
 * Aggregate rows by different time granularities
 * @param {Array<Object>} rows
 * @returns {Object} { monthly, daily, quarterly, yearly }
 */
export function aggregateTimeline(rows) {
  const monthlyMap = new Map();
  const dailyMap = new Map();
  const quarterlyMap = new Map();
  const yearlyMap = new Map();

  // Sort rows chronologically
  const sorted = [...rows].sort((a, b) => a.timestamp - b.timestamp);

  let cumulativeProfit = 0;

  sorted.forEach((row) => {
    cumulativeProfit += row.profit;
    row.cumulativeProfit = cumulativeProfit;

    // Monthly
    const mKey = row.monthKey;
    if (!monthlyMap.has(mKey)) {
      monthlyMap.set(mKey, {
        period: mKey,
        sortKey: row.monthSortKey,
        revenue: 0,
        expense: 0,
        profit: 0,
        count: 0,
        timestamp: row.timestamp,
      });
    }
    const mData = monthlyMap.get(mKey);
    mData.revenue += row.revenue;
    mData.expense += row.expense;
    mData.profit += row.profit;
    mData.count += 1;

    // Daily
    const dKey = row.dateStr;
    if (!dailyMap.has(dKey)) {
      dailyMap.set(dKey, {
        period: dKey,
        sortKey: dKey,
        revenue: 0,
        expense: 0,
        profit: 0,
        count: 0,
        timestamp: row.timestamp,
      });
    }
    const dData = dailyMap.get(dKey);
    dData.revenue += row.revenue;
    dData.expense += row.expense;
    dData.profit += row.profit;
    dData.count += 1;

    // Quarterly
    const qKey = row.quarterKey;
    if (!quarterlyMap.has(qKey)) {
      quarterlyMap.set(qKey, {
        period: qKey,
        sortKey: qKey,
        revenue: 0,
        expense: 0,
        profit: 0,
        count: 0,
        timestamp: row.timestamp,
      });
    }
    const qData = quarterlyMap.get(qKey);
    qData.revenue += row.revenue;
    qData.expense += row.expense;
    qData.profit += row.profit;
    qData.count += 1;

    // Yearly
    const yKey = row.yearKey;
    if (!yearlyMap.has(yKey)) {
      yearlyMap.set(yKey, {
        period: yKey,
        sortKey: yKey,
        revenue: 0,
        expense: 0,
        profit: 0,
        count: 0,
        timestamp: row.timestamp,
      });
    }
    const yData = yearlyMap.get(yKey);
    yData.revenue += row.revenue;
    yData.expense += row.expense;
    yData.profit += row.profit;
    yData.count += 1;
  });

  // Calculate cumulative profit for aggregated sets
  const processAggregation = (map, sortProp = 'timestamp') => {
    const list = Array.from(map.values()).sort((a, b) => a[sortProp] - b[sortProp]);
    let cum = 0;
    list.forEach((item) => {
      cum += item.profit;
      item.cumulativeProfit = cum;
      item.profitMargin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
    });
    return list;
  };

  return {
    raw: sorted,
    monthly: processAggregation(monthlyMap, 'timestamp'),
    daily: processAggregation(dailyMap, 'timestamp'),
    quarterly: processAggregation(quarterlyMap, 'timestamp'),
    yearly: processAggregation(yearlyMap, 'timestamp'),
  };
}

/**
 * Aggregate data by category for donut/pie charts
 * @param {Array<Object>} rows
 * @returns {{ expenseCategories: Array, revenueCategories: Array }}
 */
export function aggregateCategories(rows) {
  const expenseCatMap = new Map();
  const revenueCatMap = new Map();

  rows.forEach((row) => {
    const cat = row.category || 'General / Uncategorized';

    // Expense breakdown
    if (row.expense > 0) {
      if (!expenseCatMap.has(cat)) {
        expenseCatMap.set(cat, { name: cat, value: 0, count: 0 });
      }
      const expItem = expenseCatMap.get(cat);
      expItem.value += row.expense;
      expItem.count += 1;
    }

    // Revenue breakdown
    if (row.revenue > 0) {
      if (!revenueCatMap.has(cat)) {
        revenueCatMap.set(cat, { name: cat, value: 0, count: 0 });
      }
      const revItem = revenueCatMap.get(cat);
      revItem.value += row.revenue;
      revItem.count += 1;
    }
  });

  const sortByValueDesc = (map) =>
    Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // top 10 categories

  return {
    expenseCategories: sortByValueDesc(expenseCatMap),
    revenueCategories: sortByValueDesc(revenueCatMap),
  };
}

/**
 * Compute key financial KPIs from parsed rows
 * @param {Array<Object>} rows
 * @returns {Object}
 */
export function computeKPIs(rows) {
  if (!rows || rows.length === 0) {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      isProfitable: true,
      profitableRowsCount: 0,
      lossRowsCount: 0,
      avgTransactionProfit: 0,
      totalTransactions: 0,
      highestRevenueEntry: null,
      highestExpenseEntry: null,
    };
  }

  let totalRevenue = 0;
  let totalExpenses = 0;
  let netProfit = 0;
  let profitableRowsCount = 0;
  let lossRowsCount = 0;

  let highestRevenueEntry = rows[0];
  let highestExpenseEntry = rows[0];

  rows.forEach((r) => {
    totalRevenue += r.revenue;
    totalExpenses += r.expense;
    netProfit += r.profit;

    if (r.profit >= 0) {
      profitableRowsCount++;
    } else {
      lossRowsCount++;
    }

    if (r.revenue > (highestRevenueEntry?.revenue || 0)) {
      highestRevenueEntry = r;
    }
    if (r.expense > (highestExpenseEntry?.expense || 0)) {
      highestExpenseEntry = r;
    }
  });

  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : (netProfit > 0 ? 100 : (netProfit < 0 ? -100 : 0));
  const avgTransactionProfit = rows.length > 0 ? netProfit / rows.length : 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    isProfitable: netProfit >= 0,
    profitableRowsCount,
    lossRowsCount,
    avgTransactionProfit,
    totalTransactions: rows.length,
    highestRevenueEntry,
    highestExpenseEntry,
  };
}

/**
 * Main CSV parser entry point.
 * Reads a File object using PapaParse and returns structured, validated financial analysis data.
 * @param {File} file
 * @param {Object} [customMappingOverride=null]
 * @returns {Promise<Object>}
 */
export function parseFinancialCSV(file, customMappingOverride = null) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for parsing.'));
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return reject(new Error('Invalid file format. Please upload a .csv file.'));
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            return reject(new Error('The uploaded CSV file is empty or could not be read.'));
          }

          const rawHeaders = results.meta.fields || Object.keys(results.data[0] || {});
          if (!rawHeaders || rawHeaders.length === 0) {
            return reject(new Error('No columns or headers found in this CSV file.'));
          }

          // Auto detect or use custom mapping override
          const mapping = customMappingOverride || detectColumnMappings(rawHeaders);
          const detectedCurrency = detectCurrencySymbol(results.data);

          // Verify if at least one financial metric is detected
          const hasFinancialColumn = Boolean(
            mapping.revenueKey || mapping.expenseKey || mapping.profitKey
          );

          if (!hasFinancialColumn) {
            return reject(
              new Error(
                `Could not detect any financial numerical columns (Revenue, Expense, or Profit) in headers: [${rawHeaders.join(
                  ', '
                )}]. Please ensure your CSV has headers like 'Revenue', 'Sales', 'Cost', 'Expense', or 'Profit'.`
              )
            );
          }

          // Transform and normalize rows
          const parsedRows = [];
          
          results.data.forEach((row, index) => {
            // Check if row is not all empty
            const hasData = Object.values(row).some((v) => v !== null && String(v).trim() !== '');
            if (!hasData) return;

            const rawRevenue = mapping.revenueKey ? cleanNumber(row[mapping.revenueKey]) : 0;
            const rawExpense = mapping.expenseKey ? cleanNumber(row[mapping.expenseKey]) : 0;
            let rawProfit = 0;

            if (mapping.profitKey && row[mapping.profitKey] !== undefined) {
              rawProfit = cleanNumber(row[mapping.profitKey]);
            } else {
              // Auto-calculate profit: Revenue - Expense
              rawProfit = rawRevenue - rawExpense;
            }

            // If revenue is missing but expense & profit exist
            let finalRevenue = rawRevenue;
            let finalExpense = rawExpense;
            if (!mapping.revenueKey && mapping.expenseKey && mapping.profitKey) {
              finalRevenue = rawExpense + rawProfit;
            } else if (mapping.revenueKey && !mapping.expenseKey && mapping.profitKey) {
              finalExpense = rawRevenue - rawProfit;
            }

            const rawDateVal = mapping.dateKey ? row[mapping.dateKey] : null;
            const dateDetails = parseDateDetails(rawDateVal, index);

            const categoryVal = mapping.categoryKey ? String(row[mapping.categoryKey] || '').trim() : 'General';
            const descriptionVal = mapping.descriptionKey ? String(row[mapping.descriptionKey] || '').trim() : '';

            parsedRows.push({
              id: `row-${index + 1}`,
              rowIndex: index + 1,
              originalRow: row,
              date: dateDetails.dateStr,
              dateFormatted: dateDetails.dateStr,
              monthKey: dateDetails.monthKey,
              monthSortKey: dateDetails.monthSortKey,
              quarterKey: dateDetails.quarterKey,
              yearKey: dateDetails.yearKey,
              timestamp: dateDetails.timestamp,
              revenue: finalRevenue,
              expense: Math.abs(finalExpense), // store expenses as positive absolute value for charts
              profit: rawProfit,
              profitMargin: finalRevenue > 0 ? (rawProfit / finalRevenue) * 100 : 0,
              category: categoryVal || 'General',
              description: descriptionVal || (mapping.categoryKey ? categoryVal : `Entry #${index + 1}`),
              isProfitable: rawProfit >= 0,
            });
          });

          if (parsedRows.length === 0) {
            return reject(new Error('No valid data rows could be parsed from the CSV file.'));
          }

          // Aggregations
          const timeline = aggregateTimeline(parsedRows);
          const categories = aggregateCategories(parsedRows);
          const kpis = computeKPIs(parsedRows);

          resolve({
            filename: file.name,
            fileSize: file.size,
            totalRows: parsedRows.length,
            currencySymbol: detectedCurrency,
            headers: rawHeaders,
            mapping,
            rows: parsedRows,
            timeline,
            categories,
            kpis,
            hasCategoryColumn: Boolean(mapping.categoryKey) || categories.expenseCategories.length > 1,
          });
        } catch (err) {
          reject(new Error(`Failed to process CSV data: ${err.message}`));
        }
      },
      error: (error) => {
        reject(new Error(`PapaParse Error: ${error.message}`));
      },
    });
  });
}

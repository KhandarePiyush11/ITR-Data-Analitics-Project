/**
 * FinPulse Business Financial Analyzer
 * Universal JSON, NDJSON & Columnar Ingestion Engine
 * 
 * Supports standard JSON arrays, deep nested REST API payloads,
 * Pandas DataFrame exports (split/columns/index orients), and NDJSON.
 * 
 * @module parsers/jsonParser
 */

import { UnifiedDataset } from '../types';

/**
 * Flattens nested objects into top-level key-values with dot notation
 */
function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(result, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        // Nested array of objects: summarize or keep count
        result[`${newKey}.count`] = value.length;
      } else {
        // Array of primitives
        result[newKey] = value.join(', ');
      }
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Recursively searches a nested JSON structure for the best candidate array of records
 */
function findBestRecordArray(obj: any, depth = 0): Record<string, any>[] | null {
  if (depth > 6 || !obj) return null;

  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
      return obj;
    }
    return null;
  }

  if (typeof obj !== 'object') return null;

  // Check common business envelope keys first
  const highPriorityKeys = [
    'data', 'records', 'rows', 'items', 'results', 'transactions', 'payload',
    'invoices', 'entries', 'sales', 'orders', 'financials', 'ledger', 'lines',
    'statement', 'content', 'body', 'response', 'value', 'elements', 'list'
  ];

  for (const k of highPriorityKeys) {
    if (Array.isArray(obj[k]) && obj[k].length > 0 && typeof obj[k][0] === 'object') {
      return obj[k];
    }
  }

  // Next, inspect any child arrays
  let bestCandidate: Record<string, any>[] | null = null;
  let maxLen = 0;

  for (const [_, val] of Object.entries(obj)) {
    if (Array.isArray(val) && val.length > maxLen && typeof val[0] === 'object' && val[0] !== null) {
      maxLen = val.length;
      bestCandidate = val as Record<string, any>[];
    }
  }

  if (bestCandidate) return bestCandidate;

  // Finally, recursively search nested objects
  for (const [_, val] of Object.entries(obj)) {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      const nested = findBestRecordArray(val, depth + 1);
      if (nested && nested.length > 0) {
        return nested;
      }
    }
  }

  return null;
}

/**
 * Handles Pandas split orient: { "columns": ["Date", "Sales"], "data": [["2024-01-01", 100], ...] }
 */
function parsePandasSplit(obj: any): Record<string, any>[] | null {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray(obj.columns) &&
    Array.isArray(obj.data) &&
    obj.data.length > 0
  ) {
    const cols: string[] = obj.columns.map((c: any) => String(c));
    return obj.data.map((row: any[]) => {
      const record: Record<string, any> = {};
      cols.forEach((col, idx) => {
        record[col] = Array.isArray(row) ? row[idx] : '';
      });
      return record;
    });
  }
  return null;
}

/**
 * Handles Pandas column orient: { "Date": ["2024-01-01", "2024-01-02"], "Sales": [100, 200] }
 * or { "Date": { "0": "2024-01-01" }, "Sales": { "0": 100 } }
 */
function parsePandasColumns(obj: any): Record<string, any>[] | null {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return null;

  const keys = Object.keys(obj);
  if (keys.length === 0) return null;

  const firstVal = obj[keys[0]];
  // If first value is an array of primitives
  if (Array.isArray(firstVal) && firstVal.length > 0) {
    const rowCount = firstVal.length;
    const records: Record<string, any>[] = [];
    for (let r = 0; r < rowCount; r++) {
      const row: Record<string, any> = {};
      keys.forEach((col) => {
        row[col] = Array.isArray(obj[col]) ? obj[col][r] : '';
      });
      records.push(row);
    }
    return records;
  }

  // If first value is a mapping of index -> value { "0": val, "1": val }
  if (typeof firstVal === 'object' && firstVal !== null) {
    const indices = Object.keys(firstVal);
    if (indices.length > 0 && !isNaN(Number(indices[0]))) {
      const records: Record<string, any>[] = [];
      indices.forEach((idx) => {
        const row: Record<string, any> = {};
        keys.forEach((col) => {
          row[col] = obj[col] ? obj[col][idx] : '';
        });
        records.push(row);
      });
      return records;
    }
  }

  return null;
}

/**
 * Handles Dictionary of records where keys are IDs or dates:
 * { "2024-01-01": { "sales": 100, "cost": 40 }, "2024-01-02": { ... } }
 */
function parseDictionaryRecords(obj: any): Record<string, any>[] | null {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return null;

  const entries = Object.entries(obj);
  if (entries.length < 2) return null;

  // Check if all values are objects
  const allObjects = entries.every(([_, v]) => typeof v === 'object' && v !== null && !Array.isArray(v));
  if (allObjects) {
    return entries.map(([key, val]) => ({
      _id: key,
      ...(val as Record<string, any>),
    }));
  }

  return null;
}

/**
 * Handles array of arrays: [ ["Date", "Sales"], ["2024-01-01", 100] ]
 */
function parseArrayOfArrays(arr: any[]): Record<string, any>[] | null {
  if (Array.isArray(arr) && arr.length >= 2 && Array.isArray(arr[0])) {
    const headers = arr[0].map((h: any, idx: number) => String(h || `Column_${idx + 1}`).trim());
    const records: Record<string, any>[] = [];
    for (let i = 1; i < arr.length; i++) {
      const row = arr[i];
      if (Array.isArray(row)) {
        const record: Record<string, any> = {};
        headers.forEach((h: string, colIdx: number) => {
          record[h] = row[colIdx] !== undefined ? row[colIdx] : '';
        });
        records.push(record);
      }
    }
    return records;
  }
  return null;
}

/**
 * Universal JSON Ingestion Parser.
 * Automatically ingests and normalizes any business JSON structure into a UnifiedDataset.
 * 
 * @param file Browser File object
 * @returns Promise<UnifiedDataset>
 */
export async function parseJsonFile(file: File): Promise<UnifiedDataset> {
  const startTime = performance.now();
  const rawText = await file.text();
  const cleanText = rawText.trim();

  let records: Record<string, any>[] = [];
  let isNdjson = false;

  // 1. Attempt standard JSON parsing
  try {
    const parsed = JSON.parse(cleanText);

    if (Array.isArray(parsed)) {
      // Check if it's an array of arrays
      const grid = parseArrayOfArrays(parsed);
      if (grid && grid.length > 0) {
        records = grid;
      } else {
        records = parsed;
      }
    } else if (typeof parsed === 'object' && parsed !== null) {
      // Check Pandas split format
      const splitRecords = parsePandasSplit(parsed);
      if (splitRecords) {
        records = splitRecords;
      } else {
        // Check Pandas column format
        const colRecords = parsePandasColumns(parsed);
        if (colRecords) {
          records = colRecords;
        } else {
          // Check Key-Value Dictionary records
          const dictRecords = parseDictionaryRecords(parsed);
          if (dictRecords) {
            records = dictRecords;
          } else {
            // Deep search for embedded record collection
            const deepRecords = findBestRecordArray(parsed);
            if (deepRecords && deepRecords.length > 0) {
              records = deepRecords;
            } else {
              // Single object fallback
              records = [parsed];
            }
          }
        }
      }
    }
  } catch (_e) {
    // 2. Fallback to NDJSON / JSONL (line by line)
    const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const lineRecords: Record<string, any>[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      // Remove trailing comma if present
      if (line.endsWith(',')) line = line.slice(0, -1).trim();
      try {
        const item = JSON.parse(line);
        if (typeof item === 'object' && item !== null) {
          lineRecords.push(item);
        }
      } catch {
        // Skip unparseable line
      }
    }

    if (lineRecords.length > 0) {
      records = lineRecords;
      isNdjson = true;
    } else {
      throw new Error(`Failed to parse "${file.name}" as valid JSON or NDJSON.`);
    }
  }

  if (records.length === 0) {
    throw new Error(`The JSON structure in "${file.name}" did not yield any records.`);
  }

  // Flatten nested objects and compile comprehensive header list
  const headerSet = new Set<string>();
  const flattenedRows: Record<string, any>[] = [];

  for (const raw of records) {
    if (typeof raw !== 'object' || raw === null) continue;
    const flat = flattenObject(raw);
    Object.keys(flat).forEach((k) => headerSet.add(k));
    flattenedRows.push(flat);
  }

  const headers = Array.from(headerSet);
  if (headers.length === 0) {
    throw new Error(`No tabular headers could be derived from JSON file "${file.name}".`);
  }

  // Normalize all rows to have all headers
  const rows = flattenedRows.map((r) => {
    const row: Record<string, any> = {};
    headers.forEach((h) => {
      row[h] = r[h] !== undefined && r[h] !== null ? r[h] : '';
    });
    return row;
  });

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    headers,
    rows,
    metadata: {
      filename: file.name,
      fileSizeBytes: file.size,
      totalRows: rows.length,
      totalColumns: headers.length,
      detectedType: isNdjson ? 'ndjson' : 'json',
      executionTimeMs,
    },
  };
}

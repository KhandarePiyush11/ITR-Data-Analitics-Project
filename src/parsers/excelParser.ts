/**
 * FinPulse Business Financial Analyzer
 * Intelligent Excel Workbook Ingestion Engine (.xlsx, .xls, .xlsm, .xlsb, .ods)
 * 
 * Capable of automatically navigating corporate title banners, merged headers,
 * empty cover sheets, Excel serial dates, and multi-sheet financial models.
 * 
 * @module parsers/excelParser
 */

import * as XLSX from 'xlsx';
import { UnifiedDataset } from '../types';

/** Regex to match common business column names for intelligent header row scoring */
const HEADER_KEYWORD_REGEX = /(date|time|period|month|year|day|amount|total|sum|rev|sales|income|exp|cost|price|qty|cat|type|desc|item|id|ref|name|credit|debit|balance|tax|profit|margin|memo|particulars|status|vendor|customer|client|head)/i;

/**
 * Converts an Excel serial date number (e.g. 45290) to an ISO YYYY-MM-DD string
 */
function excelSerialDateToIso(serial: number): string | null {
  // Excel epoch: Jan 1, 1900. (Between 25569 [1970] and 60000 [2064])
  if (serial >= 25569 && serial <= 60000) {
    const msSinceEpoch = (serial - 25569) * 86400 * 1000;
    const date = new Date(msSinceEpoch);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  return null;
}

/**
 * Evaluates candidate rows to find the true table header row index.
 * Solves the common corporate issue of reports having 2-5 banner/title rows at the top.
 */
function findHeaderRowIndex(grid: any[][]): number {
  if (grid.length === 0) return 0;

  let bestIndex = 0;
  let highestScore = -1;

  const maxScanRows = Math.min(25, grid.length);

  for (let r = 0; r < maxScanRows; r++) {
    const row = grid[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    // Filter non-empty cells
    const nonNullCells = row.filter((c) => c !== undefined && c !== null && String(c).trim() !== '');
    if (nonNullCells.length < 2) continue;

    let score = 0;
    let keywordMatches = 0;
    let stringCount = 0;

    nonNullCells.forEach((cell) => {
      const strVal = String(cell).trim();
      // Headers are almost exclusively strings, rarely pure numbers
      if (typeof cell === 'string' || isNaN(Number(strVal))) {
        stringCount++;
      }
      if (HEADER_KEYWORD_REGEX.test(strVal)) {
        keywordMatches++;
      }
    });

    const stringRatio = stringCount / nonNullCells.length;
    score = nonNullCells.length * 1.5 + keywordMatches * 3.0 + stringRatio * 2.0;

    // Check if the row immediately below has data (numeric or date values)
    if (r + 1 < grid.length) {
      const nextRow = grid[r + 1];
      if (Array.isArray(nextRow)) {
        const nextNonNulls = nextRow.filter((c) => c !== undefined && c !== null && String(c).trim() !== '');
        if (nextNonNulls.length >= 2) {
          score += 2.0;
        }
      }
    }

    if (score > highestScore && keywordMatches > 0) {
      highestScore = score;
      bestIndex = r;
    }
  }

  return bestIndex;
}

/**
 * Parses Microsoft Excel binary workbooks (.xlsx, .xls, .xlsm, .xlsb, .ods) into a UnifiedDataset.
 * Preserves date formatting, extracts all workbook sheets, and normalizes cell records.
 * 
 * @param file Browser File object
 * @param preferredSheetName Optional sheet name to target
 * @returns Promise<UnifiedDataset>
 */
export async function parseExcelWorkbook(file: File, preferredSheetName?: string): Promise<UnifiedDataset> {
  const startTime = performance.now();

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    cellNF: true,
    cellText: false,
    raw: false,
  });

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error(`The Excel file "${file.name}" contains no readable worksheets.`);
  }

  // If no preferred sheet specified, inspect all sheets to find the primary data sheet
  let targetSheetName = sheetNames[0];

  if (preferredSheetName && sheetNames.includes(preferredSheetName)) {
    targetSheetName = preferredSheetName;
  } else if (sheetNames.length > 1) {
    // Find the sheet with the most non-empty rows/cells
    let maxRows = 0;
    for (const name of sheetNames) {
      const ws = workbook.Sheets[name];
      if (ws && ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        const rowCount = range.e.r - range.s.r + 1;
        if (rowCount > maxRows) {
          maxRows = rowCount;
          targetSheetName = name;
        }
      }
    }
  }

  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) {
    throw new Error(`Worksheet "${targetSheetName}" not found in "${file.name}".`);
  }

  // Convert worksheet to 2D array for intelligent header detection
  const grid: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!grid || grid.length === 0) {
    throw new Error(`Worksheet "${targetSheetName}" in "${file.name}" is empty.`);
  }

  // Find true header row index (skipping title banners or preamble notes)
  const headerRowIdx = findHeaderRowIndex(grid);
  const rawHeaderRow = grid[headerRowIdx] || [];

  // Compile unique, clean headers
  const headers: string[] = [];
  const headerCountMap = new Map<string, number>();

  rawHeaderRow.forEach((h: any, idx: number) => {
    let name = String(h || '').trim();
    if (!name || name.startsWith('__EMPTY')) {
      name = `Column_${idx + 1}`;
    }
    const count = headerCountMap.get(name) || 0;
    if (count > 0) {
      headers.push(`${name}_${count + 1}`);
    } else {
      headers.push(name);
    }
    headerCountMap.set(name, count + 1);
  });

  if (headers.length === 0) {
    throw new Error(`Could not identify valid headers in Excel sheet "${targetSheetName}".`);
  }

  // Compile data rows below the header row
  const rows: Record<string, any>[] = [];

  for (let r = headerRowIdx + 1; r < grid.length; r++) {
    const rowData = grid[r];
    if (!Array.isArray(rowData)) continue;

    let hasValue = false;
    const rowObj: Record<string, any> = {};

    headers.forEach((h, colIdx) => {
      let val = rowData[colIdx];

      if (val instanceof Date) {
        // Format ISO date string YYYY-MM-DD
        val = val.toISOString().split('T')[0];
      } else if (typeof val === 'number') {
        // Check if column is a date column and value is an Excel serial number
        if (/date|time|period|day|month/i.test(h)) {
          const convertedDate = excelSerialDateToIso(val);
          if (convertedDate) {
            val = convertedDate;
          }
        }
      }

      const strVal = val !== undefined && val !== null ? String(val).trim() : '';
      rowObj[h] = strVal;
      if (strVal !== '') {
        hasValue = true;
      }
    });

    if (hasValue) {
      rows.push(rowObj);
    }
  }

  if (rows.length === 0) {
    throw new Error(`No data rows found below headers in Excel sheet "${targetSheetName}".`);
  }

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    headers,
    rows,
    metadata: {
      filename: file.name,
      fileSizeBytes: file.size,
      totalRows: rows.length,
      totalColumns: headers.length,
      detectedType: file.name.endsWith('.xls') ? 'xls' : 'xlsx',
      sheetNames,
      activeSheet: targetSheetName,
      executionTimeMs,
    },
  };
}

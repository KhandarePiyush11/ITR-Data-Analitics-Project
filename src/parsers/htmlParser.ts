/**
 * FinPulse Business Financial Analyzer
 * Browser-Native HTML Table Parser (.html, .htm)
 * 
 * Supports exported financial reports from accounting packages,
 * bank portals, and ERPs containing <table> structures.
 * 
 * @module parsers/htmlParser
 */

import { UnifiedDataset } from '../types';

/**
 * Parses HTML documents containing tabular financial tables into a UnifiedDataset.
 * Automatically identifies the primary data table, extracts column headers,
 * and strips HTML markup from cell values.
 * 
 * @param file Browser File object
 * @returns Promise<UnifiedDataset>
 */
export async function parseHtmlTable(file: File): Promise<UnifiedDataset> {
  const startTime = performance.now();
  const rawText = await file.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawText, 'text/html');

  // Find all tables in the document
  const tables = Array.from(doc.querySelectorAll('table'));
  if (tables.length === 0) {
    throw new Error(`The HTML file "${file.name}" does not contain any <table> elements.`);
  }

  // Identify table with the most rows/cells (primary data table)
  let bestTable = tables[0];
  let maxCellCount = 0;

  for (const table of tables) {
    const cells = table.querySelectorAll('td, th');
    if (cells.length > maxCellCount) {
      maxCellCount = cells.length;
      bestTable = table;
    }
  }

  const trElements = Array.from(bestTable.querySelectorAll('tr'));
  if (trElements.length < 2) {
    throw new Error(`The HTML table in "${file.name}" has fewer than 2 rows.`);
  }

  // Extract headers: look for <th> elements or first row <td> elements
  let headerRowIndex = 0;
  let headers: string[] = [];

  for (let i = 0; i < Math.min(5, trElements.length); i++) {
    const ths = Array.from(trElements[i].querySelectorAll('th'));
    if (ths.length >= 2) {
      headers = ths.map((th) => th.textContent?.trim() || '');
      headerRowIndex = i;
      break;
    }
  }

  // Fallback: use first row's <td> elements as headers
  if (headers.length === 0) {
    const firstRowTds = Array.from(trElements[0].querySelectorAll('td'));
    if (firstRowTds.length >= 2) {
      headers = firstRowTds.map((td) => td.textContent?.trim() || '');
      headerRowIndex = 0;
    }
  }

  // Clean and deduplicate headers
  const cleanHeaders: string[] = [];
  const headerCountMap = new Map<string, number>();

  headers.forEach((h, idx) => {
    let name = h.replace(/\s+/g, ' ').trim();
    if (!name) name = `Column_${idx + 1}`;
    const count = headerCountMap.get(name) || 0;
    if (count > 0) {
      cleanHeaders.push(`${name}_${count + 1}`);
    } else {
      cleanHeaders.push(name);
    }
    headerCountMap.set(name, count + 1);
  });

  if (cleanHeaders.length === 0) {
    throw new Error(`Could not identify valid column headers in HTML table "${file.name}".`);
  }

  // Ingest data rows
  const rows: Record<string, any>[] = [];

  for (let i = headerRowIndex + 1; i < trElements.length; i++) {
    const tr = trElements[i];
    const cells = Array.from(tr.querySelectorAll('td, th'));
    if (cells.length === 0) continue;

    const rowObj: Record<string, any> = {};
    let hasValue = false;

    cleanHeaders.forEach((header, colIdx) => {
      const cellText = cells[colIdx]?.textContent?.trim() || '';
      rowObj[header] = cellText;
      if (cellText) hasValue = true;
    });

    if (hasValue) {
      rows.push(rowObj);
    }
  }

  if (rows.length === 0) {
    throw new Error(`No data rows could be extracted from HTML table in "${file.name}".`);
  }

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    headers: cleanHeaders,
    rows,
    metadata: {
      filename: file.name,
      fileSizeBytes: file.size,
      totalRows: rows.length,
      totalColumns: cleanHeaders.length,
      detectedType: 'html',
      executionTimeMs,
    },
  };
}

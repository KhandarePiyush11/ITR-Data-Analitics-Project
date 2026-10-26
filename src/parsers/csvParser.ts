/**
 * FinPulse Business Financial Analyzer
 * Robust Delimited File Parser (CSV, TSV, DSV)
 * 
 * @module parsers/csvParser
 */

import Papa from 'papaparse';
import { UnifiedDataset } from '../types';

/**
 * Parses delimited plain text files (CSV, TSV, TXT) into a clean UnifiedDataset.
 * Automatically sniffs delimiters (comma, tab, semicolon, pipe) and handles quoted fields.
 * 
 * @param file Browser File object
 * @returns Promise<UnifiedDataset>
 */
export async function parseDelimitedFile(file: File): Promise<UnifiedDataset> {
  const startTime = performance.now();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false, // Keep raw strings to allow domain-aware numeric sanitization
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        try {
          const rawRows = results.data;
          if (!rawRows || rawRows.length === 0) {
            return reject(new Error(`The file "${file.name}" contains no readable data rows.`));
          }

          // Extract headers from PapaParse metadata or row keys
          let headers = results.meta.fields || Object.keys(rawRows[0] || {});
          headers = headers.filter((h) => h && h.trim().length > 0);

          if (headers.length === 0) {
            return reject(new Error(`No valid column headers were identified in "${file.name}".`));
          }

          // Clean and prune empty rows
          const rows: Record<string, any>[] = [];
          for (let i = 0; i < rawRows.length; i++) {
            const raw = rawRows[i];
            const hasValue = headers.some((h) => {
              const val = raw[h];
              return val !== undefined && val !== null && String(val).trim() !== '';
            });
            if (hasValue) {
              rows.push(raw);
            }
          }

          const detectedType = file.name.endsWith('.tsv') ? 'tsv' : 'csv';
          const executionTimeMs = Math.round(performance.now() - startTime);

          resolve({
            headers,
            rows,
            metadata: {
              filename: file.name,
              fileSizeBytes: file.size,
              totalRows: rows.length,
              totalColumns: headers.length,
              detectedType,
              delimiter: results.meta.delimiter,
              executionTimeMs,
            },
          });
        } catch (err: any) {
          reject(new Error(`CSV processing error: ${err.message}`));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parse failure: ${error.message}`));
      },
    });
  });
}

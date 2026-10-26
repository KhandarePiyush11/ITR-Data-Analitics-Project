/**
 * FinPulse Business Financial Analyzer
 * Universal File Ingestion Router & Parser Facade
 * 
 * Supports: CSV, TSV, DSV, XLSX, XLS, XLSM, XLSB, ODS, JSON, NDJSON,
 * JSONL, XML, OFX, QFX, YAML, YML, HTML, HTM, TXT, LOG, and DAT.
 * 
 * @module parsers
 * @author Senior Data Architect & Principal Engineer
 */

import { UnifiedDataset, SupportedFileType } from '../types';
import { parseDelimitedFile } from './csvParser';
import { parseExcelWorkbook } from './excelParser';
import { parseJsonFile } from './jsonParser';
import { parseXmlFile } from './xmlParser';
import { parseHtmlTable } from './htmlParser';
import { parseYamlFile } from './yamlParser';

/**
 * Detects the file format category based on file extension and MIME type
 */
export function detectFileType(file: File): SupportedFileType {
  const ext = file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase();

  switch (ext) {
    case 'csv':
      return 'csv';
    case 'tsv':
    case 'tab':
    case 'psv':
    case 'dsv':
      return 'tsv';
    case 'xlsx':
    case 'xlsm':
    case 'xlsb':
    case 'ods':
      return 'xlsx';
    case 'xls':
      return 'xls';
    case 'json':
      return 'json';
    case 'ndjson':
    case 'jsonl':
      return 'ndjson';
    case 'xml':
    case 'ofx':
    case 'qfx':
      return 'xml';
    case 'html':
    case 'htm':
      return 'html';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'txt':
    case 'log':
    case 'dat':
    case 'prn':
      return 'txt';
    default:
      return 'unknown';
  }
}

/**
 * Universal Ingestion Facade.
 * Routes any supported raw data file to its specialized normalization strategy,
 * returning a unified tabular representation `{ headers, rows, metadata }`.
 * 
 * @param file The browser File object selected or dropped by the user
 * @param options Optional configuration (e.g., target Excel sheet)
 * @returns Promise<UnifiedDataset>
 */
export async function parseFile(
  file: File, 
  options: { preferredSheetName?: string } = {}
): Promise<UnifiedDataset> {
  if (!file) {
    throw new Error('No file provided to parser.');
  }

  const detectedType = detectFileType(file);

  try {
    switch (detectedType) {
      case 'csv':
      case 'tsv':
        return await parseDelimitedFile(file);

      case 'xlsx':
      case 'xls':
        return await parseExcelWorkbook(file, options.preferredSheetName);

      case 'json':
      case 'ndjson':
        return await parseJsonFile(file);

      case 'xml':
        return await parseXmlFile(file);

      case 'html':
        return await parseHtmlTable(file);

      case 'yaml':
        return await parseYamlFile(file);

      case 'txt': {
        // Sniff content preview for .txt, .log, .dat files
        const preview = (await file.text()).slice(0, 1000).trim();
        if (preview.startsWith('{') || preview.startsWith('[')) {
          return await parseJsonFile(file);
        } else if (preview.startsWith('<?xml') || preview.startsWith('<xml') || preview.startsWith('<table') || preview.startsWith('<!doctype html') || preview.startsWith('<html')) {
          if (preview.includes('<table') || preview.includes('<html')) {
            return await parseHtmlTable(file);
          }
          return await parseXmlFile(file);
        } else if (preview.startsWith('- ') || (preview.includes(':') && !preview.includes(','))) {
          try {
            return await parseYamlFile(file);
          } catch {
            return await parseDelimitedFile(file);
          }
        } else {
          // Default to delimited CSV/TSV parser
          return await parseDelimitedFile(file);
        }
      }

      default: {
        // Unknown extension: sniff content
        try {
          const preview = (await file.text()).slice(0, 500).trim();
          if (preview.startsWith('{') || preview.startsWith('[')) {
            return await parseJsonFile(file);
          } else if (preview.startsWith('<')) {
            return await parseXmlFile(file);
          }
        } catch {
          // Ignore sniff error and fallback to delimited
        }
        return await parseDelimitedFile(file);
      }
    }
  } catch (error: any) {
    console.error(`[UniversalParser] Ingestion failure for "${file.name}":`, error);
    throw new Error(
      error.message || `An unexpected error occurred while parsing "${file.name}". Please ensure the file is not corrupted.`
    );
  }
}

export * from './csvParser';
export * from './excelParser';
export * from './jsonParser';
export * from './xmlParser';
export * from './htmlParser';
export * from './yamlParser';

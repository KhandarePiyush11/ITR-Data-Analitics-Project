/**
 * FinPulse Business Financial Analyzer
 * Lightweight Native YAML Table Parser (.yaml, .yml)
 * 
 * Supports DevOps cost exports, modern cloud billing reports,
 * and structured YAML ledger records.
 * 
 * @module parsers/yamlParser
 */

import { UnifiedDataset } from '../types';

/**
 * Parses simple YAML files into JavaScript records.
 * Handles YAML lists of objects, key-value mappings, and scalars.
 */
function parseSimpleYaml(yamlText: string): any {
  const lines = yamlText.split(/\r?\n/).filter((l) => {
    const trimmed = l.trim();
    return trimmed.length > 0 && !trimmed.startsWith('#');
  });

  const records: Record<string, any>[] = [];
  let currentRecord: Record<string, any> | null = null;
  let isList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('- ')) {
      isList = true;
      if (currentRecord) {
        records.push(currentRecord);
      }
      currentRecord = {};
      const rest = trimmed.slice(2).trim();
      if (rest) {
        const colonIdx = rest.indexOf(':');
        if (colonIdx !== -1) {
          const k = rest.slice(0, colonIdx).trim();
          let v = rest.slice(colonIdx + 1).trim();
          v = cleanYamlValue(v);
          currentRecord[k] = v;
        }
      }
    } else if (currentRecord && rawLine.search(/\S/) > 0) {
      // Indented property of current record
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        const k = trimmed.slice(0, colonIdx).trim();
        let v = trimmed.slice(colonIdx + 1).trim();
        v = cleanYamlValue(v);
        currentRecord[k] = v;
      }
    } else {
      // Top-level key: value
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1 && !isList) {
        if (!currentRecord) currentRecord = {};
        const k = trimmed.slice(0, colonIdx).trim();
        let v = trimmed.slice(colonIdx + 1).trim();
        v = cleanYamlValue(v);
        currentRecord[k] = v;
      }
    }
  }

  if (currentRecord) {
    records.push(currentRecord);
  }

  return records;
}

function cleanYamlValue(val: string): any {
  if (!val) return '';
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  if (val.toLowerCase() === 'true') return true;
  if (val.toLowerCase() === 'false') return false;
  if (val.toLowerCase() === 'null') return '';
  const num = Number(val);
  if (!isNaN(num) && val.trim() !== '') return num;
  return val;
}

/**
 * Parses YAML files into a UnifiedDataset
 * 
 * @param file Browser File object
 * @returns Promise<UnifiedDataset>
 */
export async function parseYamlFile(file: File): Promise<UnifiedDataset> {
  const startTime = performance.now();
  const rawText = await file.text();

  const records = parseSimpleYaml(rawText);

  if (!records || records.length === 0) {
    throw new Error(`The YAML file "${file.name}" contains no valid structured records.`);
  }

  const headerSet = new Set<string>();
  records.forEach((r: Record<string, any>) => {
    Object.keys(r).forEach((k) => headerSet.add(k));
  });

  const headers = Array.from(headerSet);
  if (headers.length === 0) {
    throw new Error(`Could not extract column headers from YAML file "${file.name}".`);
  }

  const rows = records.map((r: Record<string, any>) => {
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
      detectedType: 'yaml',
      executionTimeMs,
    },
  };
}

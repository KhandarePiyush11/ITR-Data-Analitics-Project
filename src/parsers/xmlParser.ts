/**
 * FinPulse Business Financial Analyzer
 * Intelligent XML & Banking Ingestion Engine (.xml, .ofx, .qfx)
 * 
 * Supports CAMT.053 bank statements, OFX/QFX transaction logs,
 * UBL e-invoices, and custom enterprise XML exports.
 * 
 * @module parsers/xmlParser
 */

import { UnifiedDataset } from '../types';

/** Common financial tag keywords for scoring repeating XML nodes */
const FINANCIAL_XML_TAGS = /(transaction|record|row|entry|invoice|item|sale|payment|expense|order|bill|voucher|line|element|data|statement|movement|posting|ntry|stmttrn|detail|account|lineitem)/i;

/**
 * Gets the local tag name without namespace prefix (e.g. 'cac:InvoiceLine' -> 'invoiceline')
 */
function getCleanTagName(el: Element): string {
  const name = el.localName || el.tagName;
  const colonIdx = name.indexOf(':');
  return colonIdx !== -1 ? name.slice(colonIdx + 1).toLowerCase() : name.toLowerCase();
}

/**
 * Recursively flattens an XML element's attributes and child elements into key-values
 */
function flattenXmlElement(el: Element, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  // 1. Ingest attributes
  if (el.hasAttributes()) {
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      const key = prefix ? `${prefix}_${attr.name}` : attr.name;
      result[key] = attr.value.trim();
    }
  }

  // 2. Ingest child elements
  const children = Array.from(el.children);

  if (children.length === 0) {
    // Leaf node: extract text content
    const text = el.textContent?.trim() || '';
    if (text) {
      const key = prefix || 'value';
      result[key] = text;
    }
  } else {
    // Has child elements: recursively traverse
    children.forEach((child) => {
      const childName = child.localName || child.tagName;
      const cleanChildName = childName.includes(':') ? childName.slice(childName.indexOf(':') + 1) : childName;
      const keyPrefix = prefix ? `${prefix}.${cleanChildName}` : cleanChildName;

      // If child has no further child elements, directly take its text
      if (child.children.length === 0) {
        const text = child.textContent?.trim() || '';
        result[keyPrefix] = text;
        // Ingest any attributes child might have
        if (child.hasAttributes()) {
          for (let i = 0; i < child.attributes.length; i++) {
            const attr = child.attributes[i];
            result[`${keyPrefix}_${attr.name}`] = attr.value.trim();
          }
        }
      } else {
        // Child has sub-children: recurse
        Object.assign(result, flattenXmlElement(child, keyPrefix));
      }
    });
  }

  return result;
}

/**
 * Parses XML documents containing tabular records into a UnifiedDataset.
 * Automatically discovers repeating row tags and flattens child nodes & attributes.
 * 
 * @param file Browser File object
 * @returns Promise<UnifiedDataset>
 */
export async function parseXmlFile(file: File): Promise<UnifiedDataset> {
  const startTime = performance.now();
  const rawText = await file.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(rawText, 'application/xml');

  // Check for XML parsing error elements
  const parserError = xmlDoc.getElementsByTagName('parsererror');
  if (parserError.length > 0) {
    throw new Error(`XML syntax error: ${parserError[0].textContent?.slice(0, 100) || 'Invalid XML'}`);
  }

  // Collect all elements across the entire document
  const allElements = Array.from(xmlDoc.getElementsByTagName('*'));

  // Group elements by clean local tag name
  const tagGroups = new Map<string, Element[]>();

  allElements.forEach((el) => {
    // Skip document root element
    if (el === xmlDoc.documentElement) return;

    // Filter elements that have either child elements or attributes (to avoid leaf text tags)
    if (el.children.length > 0 || el.hasAttributes()) {
      const tagName = getCleanTagName(el);
      const list = tagGroups.get(tagName) || [];
      list.push(el);
      tagGroups.set(tagName, list);
    }
  });

  // Score candidate groups to identify true repeating data records
  let bestElements: Element[] = [];
  let highestScore = -1;

  tagGroups.forEach((elements, tagName) => {
    if (elements.length < 2) return;

    let score = elements.length * 1.5;

    // Keyword match boost
    if (FINANCIAL_XML_TAGS.test(tagName)) {
      score += 50.0;
    }

    // Average child count boost (rich records have multiple child fields)
    const avgChildCount = elements.reduce((acc, el) => acc + el.children.length + el.attributes.length, 0) / elements.length;
    score += avgChildCount * 3.0;

    if (score > highestScore) {
      highestScore = score;
      bestElements = elements;
    }
  });

  // Fallback: search direct children of document root
  if (bestElements.length === 0 && xmlDoc.documentElement) {
    const rootChildren = Array.from(xmlDoc.documentElement.children);
    if (rootChildren.length > 0) {
      bestElements = rootChildren;
    }
  }

  if (bestElements.length === 0) {
    throw new Error(`No repeating tabular records (<transaction>, <row>, <item>, etc.) identified in "${file.name}".`);
  }

  // Extract flattened records
  const headerSet = new Set<string>();
  const parsedRecords: Record<string, any>[] = [];

  bestElements.forEach((el) => {
    const record = flattenXmlElement(el);
    if (Object.keys(record).length > 0) {
      Object.keys(record).forEach((k) => headerSet.add(k));
      parsedRecords.push(record);
    }
  });

  const headers = Array.from(headerSet);
  if (headers.length === 0) {
    throw new Error(`Unable to extract field headers from XML elements in "${file.name}".`);
  }

  // Ensure all rows contain all extracted headers
  const rows = parsedRecords.map((r) => {
    const normalized: Record<string, any> = {};
    headers.forEach((h) => {
      normalized[h] = r[h] !== undefined && r[h] !== null ? r[h] : '';
    });
    return normalized;
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
      detectedType: 'xml',
      executionTimeMs,
    },
  };
}

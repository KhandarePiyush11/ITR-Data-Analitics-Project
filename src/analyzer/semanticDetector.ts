/**
 * FinPulse Business Financial Analyzer
 * Semantic Domain Role Classifier & Financial Entity Detector
 * 
 * Trained on universal business ledgers: ERPs (SAP, NetSuite, Oracle),
 * Small Business accounting (QuickBooks, Xero, Wave, Tally, Zoho),
 * Banking exports (OFX, MT940, CAMT.053, CSV statements),
 * E-Commerce & Retail (Shopify, Stripe, Amazon, Square, PayPal),
 * and Multi-Lingual corporate balance sheets.
 * 
 * @module analyzer/semanticDetector
 */

import { SemanticRole, InferredDataType } from '../types';

/** Regex matching dictionaries for common business ledger and tax vocabularies */
const SEMANTIC_PATTERNS: Record<SemanticRole, { exact: RegExp; partial: RegExp }> = {
  timestamp: {
    exact: /^(date|time|timestamp|datetime|period|month|day|year|quarter|fiscal_year|fiscal_period|trx_date|transaction_date|tx_date|invoice_date|payment_date|created_at|updated_at|posted_date|posting_date|value_date|effective_date|bill_date|due_date|order_date|datum|fecha|data|dt)$/i,
    partial: /(date|time|period|month|day|year|quarter|timestamp|created|posted|effective|invoice_date|order_date|datum|fecha|data)/i,
  },
  revenue: {
    exact: /^(revenue|turnover|sales|income|earnings|gross|inflow|inflow_amount|amount_received|credit|cr|cr_amt|cr_amount|credit_amount|receipts|deposit|deposits|deposit_amt|deposit_amount|total_sales|gross_revenue|gross_sales|total_revenue|amount|total|net_amount|sales_amount|paid_in|money_in|billed|billing|collections|proceeds|subtotal|order_total|order_value|gmv|mrr|arr|cash_in|funds_in|sale_price|selling_price|topline|einnahmen|umsatz|ventas|ingresos|recettes|receita|faturamento|rendita|chiffre_d_affaires|revenu|jama)$/i,
    partial: /(revenue|turnover|sales|income|earnings|inflow|receipt|credit|deposit|billable|billing|gmv|mrr|arr|topline|proceeds|collections|paid_in|money_in|cash_in|einnahmen|umsatz|ventas|ingresos|recettes|receita)/i,
  },
  expense: {
    exact: /^(expense|expenses|cost|costs|payout|payouts|spending|spend|outflow|outflow_amount|expenditure|fees|purchase|purchases|debit|dr|dr_amt|dr_amount|debit_amount|bills|total_expense|operating_cost|cogs|opex|capex|paid|spent|charges|withdrawal|withdrawals|withdrawal_amt|withdrawal_amount|paid_out|money_out|disbursement|remittance|overhead|payroll|salaries|salary|deductions|loss|losses|refund|refunds|discount|discounts|cash_out|funds_out|cost_price|expense_amount|ausgaben|kosten|gastos|costes|dépenses|charges|despesas|custos|spese|oneri|nikasi|kharcha)$/i,
    partial: /(expense|cost|payout|spending|spend|outflow|expenditure|fee|purchase|debit|cogs|opex|capex|payroll|salary|overhead|disbursement|withdrawal|paid_out|money_out|cash_out|charge|ausgaben|kosten|gastos|costes|dépenses|despesas)/i,
  },
  profit: {
    exact: /^(profit|margin|net|net_income|gain|net_profit|operating_profit|operating_income|ebitda|ebit|surplus|bottom_line|retained_earnings|profit_loss|pnl|gewinn|beneficio|bénéfice|lucro|utile)$/i,
    partial: /(profit|margin|net_income|net_profit|gain|ebitda|ebit|surplus|bottom_line|pnl|gewinn|beneficio|bénéfice|lucro)/i,
  },
  tax: {
    exact: /^(tax|taxes|vat|gst|hst|pst|cgst|sgst|igst|tds|tcs|sales_tax|tax_amount|tax_rate|withholding|tax_liability|deductions|duty|tariff|customs|steuer|impuesto|imposta|tva|imposto)$/i,
    partial: /(tax|vat|gst|hst|pst|cgst|sgst|igst|tds|withholding|duty|deduction|tariff|customs|steuer|impuesto|imposta|tva)/i,
  },
  entity_id: {
    exact: /^(id|uuid|code|sku|ref|reference|invoice_no|invoice_number|order_id|customer_id|client_id|txn_id|transaction_id|account_no|account_number|cheque_no|chq_no|utr|receipt_no|bill_no|voucher_no|tracking_no|ssn|ein|vat_no|gstin)$/i,
    partial: /(id|uuid|code|sku|ref|reference|invoice|order|customer|client|account|cheque|receipt|voucher|tracking|ssn|ein|gstin)/i,
  },
  category: {
    exact: /^(category|type|product|department|dept|item|segment|group|class|service|channel|status|vertical|account|ledger|head|cost_center|particulars|kategorie|categoria|catégorie)$/i,
    partial: /(category|type|product|department|dept|item|segment|group|channel|status|vertical|account|ledger|particulars|kategorie|categoria)/i,
  },
  description: {
    exact: /^(description|desc|memo|notes|note|detail|details|name|title|comment|remarks|narrative|narration|particulars|payee|vendor|merchant|customer_name|client_name|payer|counterparty|beneficiary)$/i,
    partial: /(description|desc|memo|note|detail|name|comment|remark|narrative|narration|payee|vendor|merchant|counterparty|beneficiary)/i,
  },
  quantity: {
    exact: /^(qty|quantity|units|count|volume|hours|seats|pieces|pcs|shares|lots|headcount|menge|cantidad|quantité)$/i,
    partial: /(qty|quantity|units|count|volume|hours|seats|pieces|pcs|shares|headcount|menge|cantidad)/i,
  },
  rate: {
    exact: /^(rate|price|unit_price|cost_per_unit|fee_rate|multiplier|unit_cost|unit_rate|tariff)$/i,
    partial: /(rate|price|unit_price|multiplier|unit_cost)/i,
  },
  unknown: {
    exact: /^$/,
    partial: /^$/,
  },
};

/**
 * Normalizes header string by stripping currency symbols, punctuation, and multiple spaces
 */
function normalizeHeaderName(raw: string): string {
  return raw
    .replace(/[$€£₹¥₩\[\]\(\)\._\-\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Evaluates a column's name, inferred type, and statistical characteristics
 * to assign the most appropriate semantic business role.
 * 
 * @param columnName The raw or trimmed column header name
 * @param inferredType The column's primitive data type
 * @param sampleValues Sample values from the column
 * @returns { role: SemanticRole, confidence: number }
 */
export function detectSemanticRole(
  columnName: string,
  inferredType: InferredDataType,
  sampleValues: any[] = []
): { role: SemanticRole; confidence: number } {
  const cleanName = columnName.trim();
  const normalizedName = normalizeHeaderName(cleanName);
  const isNumeric = inferredType === 'numeric' || inferredType === 'currency';
  const isDate = inferredType === 'date';

  let bestRole: SemanticRole = 'unknown';
  let bestScore = 0;

  for (const [role, patterns] of Object.entries(SEMANTIC_PATTERNS) as [SemanticRole, { exact: RegExp; partial: RegExp }][]) {
    if (role === 'unknown') continue;

    let score = 0;

    // Header exact match against raw or normalized name
    if (patterns.exact.test(cleanName) || patterns.exact.test(normalizedName)) {
      score += 0.75;
    } else if (patterns.partial.test(cleanName) || patterns.partial.test(normalizedName)) {
      score += 0.45;
    }

    if (score > 0) {
      // Data type alignment boosts
      if (role === 'timestamp' && isDate) score += 0.35;
      if (
        (role === 'revenue' || role === 'expense' || role === 'profit' || role === 'tax' || role === 'quantity' || role === 'rate') &&
        isNumeric
      ) {
        score += 0.3;
      }
      if (role === 'entity_id' && (inferredType === 'id' || inferredType === 'text')) {
        score += 0.25;
      }
      if (role === 'category' && (inferredType === 'categorical' || inferredType === 'text')) {
        score += 0.25;
      }

      if (score > bestScore) {
        bestScore = score;
        bestRole = role;
      }
    }
  }

  // Value-based heuristic inspection if confidence is still low or unknown
  if (bestRole === 'unknown' || bestScore < 0.5) {
    if (isDate) {
      return { role: 'timestamp', confidence: 0.85 };
    }

    // Check if values indicate transaction types (CR / DR, Inflow / Outflow)
    if (sampleValues.length > 0) {
      const stringSamples = sampleValues
        .map((v) => String(v || '').trim().toLowerCase())
        .filter(Boolean);

      const isTypeIndicator = stringSamples.some((s) =>
        /^(cr|dr|credit|debit|deposit|withdrawal|inflow|outflow|sale|expense|income|payment)$/i.test(s)
      );
      if (isTypeIndicator) {
        return { role: 'category', confidence: 0.8 };
      }
    }

    if (inferredType === 'currency') {
      return { role: 'revenue', confidence: 0.6 };
    }
    if (inferredType === 'categorical') {
      return { role: 'category', confidence: 0.55 };
    }
  }

  return {
    role: bestRole,
    confidence: Math.min(1.0, Math.round(bestScore * 100) / 100),
  };
}

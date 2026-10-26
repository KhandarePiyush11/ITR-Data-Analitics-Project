import { formatCurrency, formatPercentage } from './formatters';

/**
 * Executive Report & Financial Data Export Utilities.
 */

export function exportComprehensiveCSV(rows, kpis, filename = 'financial_analysis.csv') {
  const headers = [
    'Date',
    'Category',
    'Description',
    'Revenue',
    'Expense',
    'Net Profit',
    'Profit Margin (%)',
    'Status',
  ];

  const csvRows = [
    `# Financial Analysis Export for: ${filename}`,
    `# Total Revenue: ${kpis.totalRevenue} | Total Expenses: ${kpis.totalExpenses} | Net Profit: ${kpis.netProfit} | Margin: ${kpis.profitMargin.toFixed(2)}%`,
    '',
    headers.join(','),
    ...rows.map((r) =>
      [
        `"${r.date}"`,
        `"${(r.category || '').replace(/"/g, '""')}"`,
        `"${(r.description || '').replace(/"/g, '""')}"`,
        r.revenue,
        r.expense,
        r.profit,
        `"${r.profitMargin.toFixed(2)}%"`,
        `"${r.profit >= 0 ? 'Profit' : 'Loss'}"`,
      ].join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `executive_financial_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerPrintReport() {
  window.print();
}

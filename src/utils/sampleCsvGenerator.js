/**
 * Generates and triggers a browser download for a sample Business Financial CSV.
 * Useful for users who want a template file to test the dynamic parser immediately.
 */

export function downloadSampleCsvTemplate() {
  const sampleData = `Date,Category,Description,Revenue,Expense
2024-01-15,Software & SaaS,Enterprise Cloud Hosting,$42500,$12400
2024-01-28,Consulting,Strategic Digital Advisory,$28000,$4200
2024-02-10,Marketing & Ads,Q1 Growth Campaign,$51200,$24600
2024-02-22,Hardware,Workstation & Server Upgrades,$0,$18500
2024-03-05,Software & SaaS,Annual SaaS Subscriptions,$65000,$14200
2024-03-19,Salaries & HR,Quarterly Bonuses & Payroll,$0,$38000
2024-04-12,Product Sales,Flagship Enterprise Licenses,$89000,$21500
2024-04-25,Operations,Office Lease & Utilities,$0,$9500
2024-05-08,Consulting,Implementation Services,$34500,$6800
2024-05-24,Marketing & Ads,Search & Social Retargeting,$48200,$19800
2024-06-15,Software & SaaS,Custom Feature Expansion,$73400,$16500
2024-06-30,Legal & Compliance,Annual Audit & Retainer,$0,$12000
2024-07-14,Product Sales,Tier 2 Enterprise Expansion,$94000,$23000
2024-07-28,Operations,Logistics & Inventory Support,$12000,$14500
2024-08-11,Software & SaaS,Recurring Platform Subscriptions,$81200,$15800
2024-08-25,Marketing & Ads,Global Brand Campaign,$62000,$28400
2024-09-09,Consulting,Executive Security Review,$41500,$7500
2024-09-23,Hardware,Network Infrastructure,$0,$16200
2024-10-07,Product Sales,Q4 Enterprise Rollout,$112000,$31000
2024-10-21,Operations,Facility Maintenance & Travel,$0,$8900
2024-11-12,Software & SaaS,Enterprise Add-on Packs,$78500,$17200
2024-11-28,Salaries & HR,Year-End Performance Retainers,$0,$42000
2024-12-10,Product Sales,Annual Software Renewals,$128000,$29500
2024-12-28,Marketing & Ads,Holiday Promotion Push,$54000,$22000`;

  const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'sample_business_financial_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

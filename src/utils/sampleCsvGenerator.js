/**
 * Multi-Industry Financial Datasets & Demo Generators.
 * Allows users to test and experience the analyzer across diverse business verticals with 1 click.
 */

export const INDUSTRY_DATASETS = {
  saas: {
    id: 'saas',
    name: 'SaaS & Cloud Tech',
    icon: '🚀',
    description: 'B2B Software subscriptions, cloud hosting infrastructure, marketing CAC, and developer salaries.',
    filename: 'saas_cloud_tech_financials_2024.csv',
    csv: `Date,Category,Description,Revenue,Expense
2024-01-15,Subscriptions,Enterprise Tier Subscriptions,$52000,$8400
2024-01-28,Cloud Infrastructure,AWS & Kubernetes Cluster Hosting,$0,$14200
2024-02-10,Marketing & CAC,Google & LinkedIn B2B Paid Search,$0,$18600
2024-02-22,Subscriptions,Mid-Market SaaS Add-on Seats,$41500,$6200
2024-03-05,Professional Services,Enterprise Custom Implementation,$38000,$9500
2024-03-19,Payroll & Talent,Core Engineering & Product Team,$0,$34000
2024-04-12,Subscriptions,Annual Enterprise License Renewals,$89000,$12400
2024-04-25,Operations & SaaS Tools,CRM & Internal DevOps Licenses,$0,$7800
2024-05-08,Consulting & Support,Dedicated Technical Account Managers,$29500,$5400
2024-05-24,Marketing & CAC,Q2 Demand Generation Campaign,$0,$21000
2024-06-15,Subscriptions,Global Multi-Region SaaS Expansion,$96400,$15200
2024-06-30,Legal & Compliance,SOC-2 & ISO 27001 Annual Audits,$0,$11500
2024-07-14,Subscriptions,Usage-based API Billing Inflow,$72800,$10800
2024-07-28,Cloud Infrastructure,Datadog & CDN Scaled Traffic,$0,$16500
2024-08-11,Subscriptions,Enterprise Plan Upgrades,$108000,$18200
2024-08-25,Marketing & CAC,Annual User Summit & Sponsorships,$0,$26400
2024-09-09,Professional Services,Data Migration & Training Packages,$34500,$7200
2024-09-23,Payroll & Talent,Q3 Team Performance Bonuses,$0,$31000
2024-10-07,Subscriptions,Q4 Strategic Enterprise Onboarding,$135000,$22400
2024-10-21,Operations & SaaS Tools,Security & Endpoint Tooling,$0,$8600
2024-11-12,Subscriptions,Multi-Year Pre-Paid Contracts,$142000,$24800
2024-11-28,Cloud Infrastructure,Black Friday Prep & Redundancy,$0,$19500
2024-12-10,Subscriptions,Year-End Enterprise SaaS Renewals,$168000,$28900
2024-12-28,Payroll & Talent,Executive & Engineering Retainers,$0,$39000`,
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce & Retail',
    icon: '🛍️',
    description: 'Online direct-to-consumer store with product sales, inventory COGS, shipping, fulfillment, and ad spend.',
    filename: 'dtc_ecommerce_brand_2024.csv',
    csv: `Date,Category,Description,Revenue,Expense
2024-01-12,Product Sales,Winter Apparel & Accessories,$68000,$28500
2024-01-26,Fulfillment & Shipping,Carrier Logistics & Last-Mile Delivery,$0,$14200
2024-02-08,Advertising,Meta & TikTok Conversion Campaigns,$0,$24000
2024-02-20,Product Sales,Valentine's Special Collection,$74500,$31200
2024-03-05,Inventory & COGS,Bulk Raw Materials & Factory Batch,$0,$38000
2024-03-18,Product Sales,Spring Seasonal Rollout,$82000,$33400
2024-04-10,Platform Fees,Shopify Plus & Payment Gateway Fees,$0,$6800
2024-04-24,Product Sales,Footwear & Sportswear Line,$91000,$37500
2024-05-09,Advertising,Influencer Partnerships & UGC Content,$0,$19500
2024-05-22,Product Sales,Memorial Day Flash Sale,$104000,$42000
2024-06-12,Fulfillment & Shipping,3PL Warehouse Storage & Packaging,$0,$16800
2024-06-28,Product Sales,Summer Travel Gear Launch,$88500,$35200
2024-07-15,Inventory & COGS,Q3 Peak Stock Replenishment,$0,$44000
2024-07-29,Product Sales,Mid-Year Clearance Event,$116000,$48000
2024-08-14,Advertising,Google Shopping & Performance Max,$0,$27500
2024-08-28,Product Sales,Back-to-School Catalog Sales,$98000,$39400
2024-09-10,Operations,Warehouse Automation Software,$0,$9200
2024-09-25,Product Sales,Autumn Casualwear Drop,$105000,$41800
2024-10-12,Inventory & COGS,Holiday Q4 Stock Advance Build,$0,$62000
2024-10-28,Advertising,Early Black Friday Lead Generation,$0,$32000
2024-11-15,Product Sales,Early Bird VIP Holiday Orders,$145000,$58000
2024-11-29,Product Sales,Black Friday & Cyber Monday Surge,$265000,$98000
2024-12-14,Product Sales,Peak Holiday Gift Orders,$182000,$74000
2024-12-29,Fulfillment & Shipping,Expedited Holiday Air Cargo,$0,$28500`,
  },

  consulting: {
    id: 'consulting',
    name: 'Consulting & Agency',
    icon: '💼',
    description: 'Professional services firm with client retainers, strategy engagements, contractor costs, and travel.',
    filename: 'consulting_advisory_agency_2024.csv',
    csv: `Date,Category,Description,Revenue,Expense
2024-01-16,Retainers,FinTech Client Monthly Advisory,$35000,$4200
2024-01-30,Project Billing,Digital Transformation Phase 1,$48000,$12500
2024-02-14,Contractor Fees,Senior Data Science Specialists,$0,$18000
2024-02-27,Retainers,Healthcare Group Strategy Retainer,$38000,$4500
2024-03-12,Travel & Hospitality,Executive On-Site Client Workshops,$0,$8600
2024-03-26,Project Billing,Supply Chain Optimization Review,$54000,$14200
2024-04-15,Retainers,Global Retail Brand Retainer,$42000,$5100
2024-04-29,Contractor Fees,UI/UX Design Studio Contractors,$0,$16500
2024-05-14,Project Billing,Mergers & Acquisitions Due Diligence,$76000,$19800
2024-05-28,Operations,Prime Office Space & Research Databases,$0,$11200
2024-06-16,Retainers,Quarterly Recurring Advisory Inflows,$45000,$5600
2024-06-30,Project Billing,Cloud Architecture Assessment,$62000,$15800
2024-07-15,Contractor Fees,Specialized Security Analysts,$0,$21000
2024-07-30,Project Billing,AI Automation Strategy Roadmap,$84000,$22000
2024-08-15,Retainers,Banking Sector Advisory Retainer,$46000,$5800
2024-08-29,Travel & Hospitality,International Client Summit Travel,$0,$12400
2024-09-14,Project Billing,Enterprise ERP Modernization Study,$92000,$24500
2024-09-28,Marketing & BizDev,Industry Keynotes & Thought Leadership,$0,$14000
2024-10-15,Retainers,Q4 Enterprise Advisory Retainers,$52000,$6400
2024-10-30,Project Billing,Global ESG Compliance Blueprint,$78000,$20500
2024-11-14,Contractor Fees,Interim Management Consultants,$0,$26000
2024-11-28,Project Billing,Year-End Corporate Strategy Wrap,$110000,$27800
2024-12-12,Retainers,Annual Client Success Renewals,$58000,$7200
2024-12-28,Operations,Year-End Firm Overhead & Insurance,$0,$16800`,
  },

  hospitality: {
    id: 'hospitality',
    name: 'Hospitality & Dining',
    icon: '🍽️',
    description: 'Restaurant and events venue with dining sales, private catering, ingredients, labor, and utilities.',
    filename: 'culinary_hospitality_group_2024.csv',
    csv: `Date,Category,Description,Revenue,Expense
2024-01-14,Dining Sales,Main Dining Room & Bar Receipts,$58000,$22400
2024-01-28,Kitchen Supplies,Fresh Organic Produce & Meat Suppliers,$0,$18600
2024-02-12,Dining Sales,Valentine's Week Tasting Menus,$72000,$26500
2024-02-26,Staff & Labor,Front of House & Culinary Team Payroll,$0,$28000
2024-03-10,Private Events,Corporate Networking Receptions,$42000,$14800
2024-03-24,Beverage & Wine,Sommelier Reserve Wine Inventory,$0,$16200
2024-04-11,Dining Sales,Spring Patio Opening Revenue,$64000,$24200
2024-04-26,Utilities & Facility,Commercial Kitchen Power, Gas & Water,$0,$9800
2024-05-12,Private Events,Mother's Day & Graduation Banquets,$86000,$31000
2024-05-27,Kitchen Supplies,Artisanal Seafood & Dairy Shipments,$0,$22500
2024-06-14,Dining Sales,Summer Cocktail & Chef Specials,$78000,$28800
2024-06-29,Staff & Labor,Seasonal Kitchen Staff & Overtime,$0,$32000
2024-07-12,Private Events,Summer Wedding Receptions,$98000,$35400
2024-07-27,Dining Sales,Weekend Brunch & Terrace Dining,$82000,$29600
2024-08-10,Marketing & PR,Food Magazine Reviews & Social Ads,$0,$7500
2024-08-25,Dining Sales,Late Summer Gastronomy Evenings,$76000,$27800
2024-09-12,Private Events,Autumn Tech Conference Dinners,$88000,$32400
2024-09-27,Kitchen Supplies,Seasonal Truffle & Autumn Harvest Stock,$0,$24000
2024-10-14,Dining Sales,Harvest Festival Tasting Menus,$84000,$30500
2024-10-29,Utilities & Facility,HVAC Maintenance & Sound System,$0,$8900
2024-11-12,Private Events,Corporate Pre-Holiday Gatherings,$94000,$34200
2024-11-28,Dining Sales,Thanksgiving Weekend Banquet Service,$112000,$39500
2024-12-14,Private Events,Executive Holiday Gala Catering,$136000,$46000
2024-12-31,Dining Sales,New Year's Eve Black Tie Dinner,$155000,$52000`,
  },
};

/**
 * Download sample CSV file
 */
export function downloadSampleCsvTemplate(industryId = 'saas') {
  const item = INDUSTRY_DATASETS[industryId] || INDUSTRY_DATASETS.saas;
  const blob = new Blob([item.csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', item.filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create a File object for live demo loading
 */
export function getSampleCsvFile(industryId = 'saas') {
  const item = INDUSTRY_DATASETS[industryId] || INDUSTRY_DATASETS.saas;
  return new File([item.csv], item.filename, {
    type: 'text/csv',
  });
}

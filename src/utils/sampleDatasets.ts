/**
 * FinPulse Business Financial Analyzer
 * Multi-Format Universal Sample Datasets Generator
 * 
 * Generates ready-to-test business files across all formats:
 * - Excel Workbook (.xlsx) with multiple sheets (Sales, OPEX)
 * - JSON Enterprise API Payload (.json) with nested transaction objects
 * - XML Banking Statement (.xml) with entries and attributes
 * - Delimited SaaS Ledger (.csv)
 * - Cloud Infrastructure Cost Report (.yaml)
 * 
 * @module utils/sampleDatasets
 */

import * as XLSX from 'xlsx';

export interface SampleDatasetOption {
  id: string;
  name: string;
  format: 'xlsx' | 'json' | 'xml' | 'csv' | 'yaml';
  badge: string;
  icon: string;
  description: string;
  filename: string;
  getFile: () => Promise<File> | File;
}

export const MULTI_FORMAT_SAMPLES: Record<string, SampleDatasetOption> = {
  excel: {
    id: 'excel',
    name: 'Multi-Sheet Financial Model',
    format: 'xlsx',
    badge: 'Excel (.xlsx)',
    icon: '📊',
    description: '3-Sheet corporate workbook with Revenue Streams, Operating Expenses, and P&L.',
    filename: 'global_enterprise_financials_2024.xlsx',
    getFile: () => {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Revenue Streams
      const revData = [
        ['Acme Global Holdings - Financial Performance Model'],
        ['Confidential - Fiscal Year 2024'],
        [], // Blank banner row to test intelligent header detection
        ['Date', 'Revenue Stream', 'Region', 'Units Sold', 'Gross Inflow', 'Tax Collected'],
        ['2024-01-15', 'Enterprise Cloud Tier', 'North America', 120, 84000, 6720],
        ['2024-01-29', 'AI Analytics Add-ons', 'EMEA', 45, 32000, 2560],
        ['2024-02-14', 'Custom Implementation', 'APAC', 8, 56000, 4480],
        ['2024-02-28', 'Enterprise Cloud Tier', 'North America', 140, 98000, 7840],
        ['2024-03-15', 'Mid-Market SaaS License', 'LATAM', 85, 42500, 3400],
        ['2024-03-30', 'Security & Compliance Add-on', 'EMEA', 60, 48000, 3840],
        ['2024-04-14', 'Enterprise Cloud Tier', 'North America', 165, 115500, 9240],
        ['2024-04-28', 'Dedicated TAM Services', 'APAC', 12, 36000, 2880],
        ['2024-05-15', 'Annual Enterprise Renewals', 'North America', 210, 147000, 11760],
        ['2024-05-30', 'AI Analytics Add-ons', 'EMEA', 78, 62400, 4992],
        ['2024-06-15', 'Enterprise Cloud Tier', 'Global', 190, 133000, 10640],
        ['2024-06-30', 'Custom Integration Packages', 'North America', 15, 67500, 5400],
      ];
      const wsRev = XLSX.utils.aoa_to_sheet(revData);
      XLSX.utils.book_append_sheet(wb, wsRev, 'Revenue Streams');

      // Sheet 2: Operating Expenses
      const expData = [
        ['Cost Center Ledger & Disbursals'],
        [],
        ['Date', 'Cost Center', 'Vendor / Payee', 'Category', 'Expense Amount'],
        ['2024-01-18', 'Engineering', 'Amazon Web Services', 'Cloud Infrastructure', 14200],
        ['2024-01-31', 'Marketing', 'Google Ads & LinkedIn B2B', 'Customer Acquisition', 18500],
        ['2024-02-15', 'Operations', 'Salesforce & Slack', 'Internal Software', 8200],
        ['2024-02-27', 'Engineering', 'Datadog & Cloudflare', 'Monitoring & CDN', 9400],
        ['2024-03-14', 'Talent', 'Global Payroll & Contractors', 'Human Resources', 38000],
        ['2024-03-29', 'Legal', 'Audit & ISO-27001 Certification', 'Compliance', 12500],
        ['2024-04-16', 'Engineering', 'AWS GPU Compute Cluster', 'Cloud Infrastructure', 19800],
        ['2024-04-30', 'Marketing', 'Q2 Growth Summit & Events', 'Advertising', 22400],
        ['2024-05-18', 'Operations', 'WeWork Office & Facilities', 'Overhead', 11000],
        ['2024-05-31', 'Talent', 'Engineering Performance Bonuses', 'Human Resources', 28500],
        ['2024-06-18', 'Engineering', 'GitHub Enterprise & OpenAI API', 'Developer Tooling', 14800],
        ['2024-06-30', 'Marketing', 'Content & Partner Sponsorships', 'Marketing', 16500],
      ];
      const wsExp = XLSX.utils.aoa_to_sheet(expData);
      XLSX.utils.book_append_sheet(wb, wsExp, 'Operating Expenses');

      // Generate binary array
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      return new File([blob], 'global_enterprise_financials_2024.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    },
  },

  json: {
    id: 'json',
    name: 'FinTech Transactions API',
    format: 'json',
    badge: 'JSON API',
    icon: '⚡',
    description: 'Nested REST API response with transactions array, metadata, and flow directions.',
    filename: 'fintech_payment_gateway_payload.json',
    getFile: () => {
      const payload = {
        api_version: '2024-09-01',
        environment: 'production',
        organization: 'Starlight Financial Corp',
        response_code: 200,
        data: {
          total_records: 14,
          currency: 'USD',
          transactions: [
            {
              txn_id: 'TXN-88401',
              timestamp: '2024-01-12T10:30:00Z',
              category: 'Merchant Processing',
              customer: 'Omni Retail Group',
              type: 'credit',
              amount: 54200.0,
              fee: 1450.0,
              status: 'settled',
            },
            {
              txn_id: 'TXN-88402',
              timestamp: '2024-01-24T14:15:00Z',
              category: 'Cloud Servers',
              customer: 'AWS Data Center',
              type: 'debit',
              amount: 12400.0,
              fee: 0.0,
              status: 'cleared',
            },
            {
              txn_id: 'TXN-88403',
              timestamp: '2024-02-05T09:00:00Z',
              category: 'SaaS Inflow',
              customer: 'Hyperion Analytics',
              type: 'credit',
              amount: 68500.0,
              fee: 1820.0,
              status: 'settled',
            },
            {
              txn_id: 'TXN-88404',
              timestamp: '2024-02-18T16:45:00Z',
              category: 'Talent & Payroll',
              customer: 'Engineering Core Contractors',
              type: 'debit',
              amount: 29000.0,
              fee: 50.0,
              status: 'cleared',
            },
            {
              txn_id: 'TXN-88405',
              timestamp: '2024-03-02T11:20:00Z',
              category: 'Merchant Processing',
              customer: 'Velocity Tech Solutions',
              type: 'credit',
              amount: 81200.0,
              fee: 2150.0,
              status: 'settled',
            },
            {
              txn_id: 'TXN-88406',
              timestamp: '2024-03-19T13:10:00Z',
              category: 'Growth Advertising',
              customer: 'Digital Ads Performance Inc',
              type: 'debit',
              amount: 19800.0,
              fee: 0.0,
              status: 'cleared',
            },
            {
              txn_id: 'TXN-88407',
              timestamp: '2024-04-08T15:30:00Z',
              category: 'SaaS Inflow',
              customer: 'Nordic Logistics AG',
              type: 'credit',
              amount: 94000.0,
              fee: 2500.0,
              status: 'settled',
            },
            {
              txn_id: 'TXN-88408',
              timestamp: '2024-04-22T10:00:00Z',
              category: 'Office & Tools',
              customer: 'SaaS Suite Licenses',
              type: 'debit',
              amount: 7600.0,
              fee: 0.0,
              status: 'cleared',
            },
            {
              txn_id: 'TXN-88409',
              timestamp: '2024-05-11T12:00:00Z',
              category: 'Merchant Processing',
              customer: 'Apex Global Ventures',
              type: 'credit',
              amount: 112000.0,
              fee: 2980.0,
              status: 'settled',
            },
            {
              txn_id: 'TXN-88410',
              timestamp: '2024-05-27T17:30:00Z',
              category: 'Compliance Audit',
              customer: 'Global Cyber Security LLC',
              type: 'debit',
              amount: 14500.0,
              fee: 100.0,
              status: 'cleared',
            },
            {
              txn_id: 'TXN-88411',
              timestamp: '2024-06-14T09:40:00Z',
              category: 'SaaS Inflow',
              customer: 'Quantum Dynamics Inc',
              type: 'credit',
              amount: 126000.0,
              fee: 3350.0,
              status: 'settled',
            },
            {
              txn_id: 'TXN-88412',
              timestamp: '2024-06-28T14:50:00Z',
              category: 'Talent & Payroll',
              customer: 'Q2 Executive Compensation',
              type: 'debit',
              amount: 34000.0,
              fee: 50.0,
              status: 'cleared',
            },
          ],
        },
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      return new File([blob], 'fintech_payment_gateway_payload.json', { type: 'application/json' });
    },
  },

  xml: {
    id: 'xml',
    name: 'Corporate Bank Ledger',
    format: 'xml',
    badge: 'XML Statement',
    icon: '🏛️',
    description: 'Banking XML statement with dates, account entities, debits, credits, and balances.',
    filename: 'corporate_commercial_bank_statement.xml',
    getFile: () => {
      const xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<BankStatement account="US89-COMM-4491-002" currency="USD" fiscalPeriod="2024-H1">
  <StatementSummary>
    <InstitutionName>Standard Commercial Banking Corp</InstitutionName>
    <GeneratedDate>2024-07-01</GeneratedDate>
    <ClosingBalance>348900.00</ClosingBalance>
  </StatementSummary>
  <Transactions>
    <Transaction id="TX-1001">
      <Date>2024-01-14</Date>
      <Description>Client Invoice Wire Payment</Description>
      <Category>Sales Revenue</Category>
      <Credit>72000.00</Credit>
      <Debit>0.00</Debit>
      <Balance>72000.00</Balance>
    </Transaction>
    <Transaction id="TX-1002">
      <Date>2024-01-26</Date>
      <Description>Core Cloud Infrastructure Provider</Description>
      <Category>Hosting Costs</Category>
      <Credit>0.00</Credit>
      <Debit>13500.00</Debit>
      <Balance>58500.00</Balance>
    </Transaction>
    <Transaction id="TX-1003">
      <Date>2024-02-12</Date>
      <Description>Software Subscription Inflows</Description>
      <Category>Sales Revenue</Category>
      <Credit>84500.00</Credit>
      <Debit>0.00</Debit>
      <Balance>143000.00</Balance>
    </Transaction>
    <Transaction id="TX-1004">
      <Date>2024-02-25</Date>
      <Description>Digital Ad Spend & Lead Gen</Description>
      <Category>Marketing Expense</Category>
      <Credit>0.00</Credit>
      <Debit>19200.00</Debit>
      <Balance>123800.00</Balance>
    </Transaction>
    <Transaction id="TX-1005">
      <Date>2024-03-10</Date>
      <Description>Professional Services Retainer</Description>
      <Category>Consulting Revenue</Category>
      <Credit>48000.00</Credit>
      <Debit>0.00</Debit>
      <Balance>171800.00</Balance>
    </Transaction>
    <Transaction id="TX-1006">
      <Date>2024-03-24</Date>
      <Description>Engineering Team Monthly Payroll</Description>
      <Category>Payroll & Talent</Category>
      <Credit>0.00</Credit>
      <Debit>32000.00</Debit>
      <Balance>139800.00</Balance>
    </Transaction>
    <Transaction id="TX-1007">
      <Date>2024-04-15</Date>
      <Description>Enterprise Annual Contract Renewals</Description>
      <Category>Sales Revenue</Category>
      <Credit>118000.00</Credit>
      <Debit>0.00</Debit>
      <Balance>257800.00</Balance>
    </Transaction>
    <Transaction id="TX-1008">
      <Date>2024-04-28</Date>
      <Description>Office Lease & Workspace Overhead</Description>
      <Category>Facilities</Category>
      <Credit>0.00</Credit>
      <Debit>11400.00</Debit>
      <Balance>246400.00</Balance>
    </Transaction>
    <Transaction id="TX-1009">
      <Date>2024-05-14</Date>
      <Description>Q2 Mid-Market License Expansion</Description>
      <Category>Sales Revenue</Category>
      <Credit>92000.00</Credit>
      <Debit>0.00</Debit>
      <Balance>338400.00</Balance>
    </Transaction>
    <Transaction id="TX-1010">
      <Date>2024-05-29</Date>
      <Description>Corporate Tax Advance Installment</Description>
      <Category>Taxes & Regulatory</Category>
      <Credit>0.00</Credit>
      <Debit>21500.00</Debit>
      <Balance>316900.00</Balance>
    </Transaction>
    <Transaction id="TX-1011">
      <Date>2024-06-16</Date>
      <Description>Global Enterprise Multi-Region Deployment</Description>
      <Category>Sales Revenue</Category>
      <Credit>138000.00</Credit>
      <Debit>0.00</Debit>
      <Balance>454900.00</Balance>
    </Transaction>
    <Transaction id="TX-1012">
      <Date>2024-06-30</Date>
      <Description>Mid-Year Bonus & Compensation Pool</Description>
      <Category>Payroll & Talent</Category>
      <Credit>0.00</Credit>
      <Debit>37500.00</Debit>
      <Balance>417400.00</Balance>
    </Transaction>
  </Transactions>
</BankStatement>`;

      const blob = new Blob([xmlStr], { type: 'application/xml' });
      return new File([blob], 'corporate_commercial_bank_statement.xml', { type: 'application/xml' });
    },
  },

  csv: {
    id: 'csv',
    name: 'SaaS & Cloud Tech',
    format: 'csv',
    badge: 'CSV',
    icon: '🚀',
    description: 'Clean delimited spreadsheet with subscriptions, marketing CAC, and developer salaries.',
    filename: 'saas_cloud_tech_financials_2024.csv',
    getFile: () => {
      const csvContent = `Date,Category,Description,Revenue,Expense
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
2024-12-28,Payroll & Talent,Executive & Engineering Retainers,$0,$39000`;

      const blob = new Blob([csvContent], { type: 'text/csv' });
      return new File([blob], 'saas_cloud_tech_financials_2024.csv', { type: 'text/csv' });
    },
  },
};

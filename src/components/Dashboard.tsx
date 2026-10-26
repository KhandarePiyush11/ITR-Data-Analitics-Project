/**
 * FinPulse Business Financial Analyzer
 * Executive Analytics Dashboard Master View
 * 
 * @module components/Dashboard
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Layers, FileDown, Sliders, Sparkles } from 'lucide-react';
import { DatasetAnalysisResult, UnifiedDataset, BusinessContext } from '../types';
import { extractFinancialKpis } from '../analyzer';
import { cleanNumericValue, parseDateCandidate } from '../analyzer/typeInference';
import { KpiOverview } from './KpiOverview';
import { BusinessGrowthSuggestions } from './BusinessGrowthSuggestions';
import { TrendLineChart } from './TrendLineChart';
import { FinancialInsights } from './FinancialInsights';
import { FilterBar } from './FilterBar';
import { AdaptiveChartGrid } from './AdaptiveChartGrid';
import { SmartDataTable } from './SmartDataTable';
import { ExportReportModal } from './ExportReportModal';

interface DashboardProps {
  analysis: DatasetAnalysisResult;
  isDarkMode: boolean;
  onSwitchSheet?: (sheetName: string) => void;
  onOpenExport?: () => void;
  onOpenMappingModal?: () => void;
  onCurrencyChange?: (symbol: string) => void;
  businessContext?: BusinessContext;
  onOpenGrowthModal?: () => void;
}

const COMMON_CURRENCIES = [
  { symbol: '$', label: '$ USD' },
  { symbol: '€', label: '€ EUR' },
  { symbol: '₹', label: '₹ INR' },
  { symbol: '£', label: '£ GBP' },
  { symbol: '¥', label: '¥ JPY' },
  { symbol: 'C$', label: 'C$ CAD' },
  { symbol: 'A$', label: 'A$ AUD' },
];

export const Dashboard: React.FC<DashboardProps> = ({
  analysis,
  isDarkMode,
  onSwitchSheet,
  onOpenExport,
  onOpenMappingModal,
  onCurrencyChange,
  businessContext = {
    businessType: 'ecommerce',
    growthPriority: 'revenue',
    businessStage: 'growth',
  },
  onOpenGrowthModal,
}) => {
  const [internalExportOpen, setInternalExportOpen] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedFlow, setSelectedFlow] = useState<'all' | 'revenue' | 'expense'>('all');

  const { dataset, columns, columnList, financialKpis, recommendedCharts } = analysis;
  const sheetNames = dataset.metadata.sheetNames || [];
  const activeSheet = dataset.metadata.activeSheet;

  // Reset filters whenever a new file or worksheet is selected
  useEffect(() => {
    setSelectedCategory('all');
    setSelectedDate('all');
    setSelectedFlow('all');
  }, [dataset.metadata.filename, dataset.metadata.activeSheet]);

  // Extract unique categories and dates for filter dropdowns with robust fallbacks
  const { categories, dates, effectiveCategoryCol, effectiveDateCol, effectiveTypeCol } = useMemo(() => {
    const catCol = financialKpis.categoryColumn ||
      columnList.find((c) => c.inferredType === 'categorical')?.name ||
      columnList.find((c) => /cat|type|dept|segment|group|item|department/i.test(c.name))?.name;

    const dtCol = financialKpis.dateColumn ||
      columnList.find((c) => c.inferredType === 'date')?.name ||
      columnList.find((c) => /date|time|period|month|day|year/i.test(c.name))?.name;

    const typCol = financialKpis.typeColumn ||
      columnList.find((c) => /^(type|txn_type|flow|flow_type|entry_type|cr_dr|dr_cr|d_c)$/i.test(c.name))?.name;

    const uniqueCats = new Set<string>();
    const uniqueDts = new Set<string>();

    dataset.rows.forEach((row) => {
      if (catCol && row[catCol] !== undefined && row[catCol] !== null) {
        const val = String(row[catCol]).trim();
        if (val) uniqueCats.add(val);
      }
      if (dtCol && row[dtCol] !== undefined && row[dtCol] !== null) {
        const raw = row[dtCol];
        const candidate = parseDateCandidate(raw);
        if (candidate) {
          const monthName = candidate.toLocaleString('en-US', { month: 'short' });
          uniqueDts.add(`${monthName} ${candidate.getFullYear()}`);
        } else {
          const val = String(raw).trim();
          if (val) uniqueDts.add(val);
        }
      }
    });

    // Sort dates chronologically
    const sortedDates = Array.from(uniqueDts).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA.getTime() - dateB.getTime();
      }
      return a.localeCompare(b);
    });

    return {
      categories: Array.from(uniqueCats).sort(),
      dates: sortedDates,
      effectiveCategoryCol: catCol,
      effectiveDateCol: dtCol,
      effectiveTypeCol: typCol,
    };
  }, [dataset, financialKpis, columnList]);

  // Compute filtered dataset with robust number & date comparisons
  const filteredDataset: UnifiedDataset = useMemo(() => {
    const { rows } = dataset;
    const catCol = effectiveCategoryCol;
    const dtCol = effectiveDateCol;
    const typCol = effectiveTypeCol;
    const revCol = financialKpis.revenueColumn;
    const expCol = financialKpis.expenseColumn;

    const filtered = rows.filter((r) => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && catCol) {
        const val = String(r[catCol] || '').trim();
        if (val !== selectedCategory) return false;
      }

      // 2. Date Filter (handles both formatted Month Year and raw ISO strings)
      if (selectedDate !== 'all' && dtCol) {
        const raw = r[dtCol];
        const candidate = parseDateCandidate(raw);
        let formatted = '';
        if (candidate) {
          const monthName = candidate.toLocaleString('en-US', { month: 'short' });
          formatted = `${monthName} ${candidate.getFullYear()}`;
        }
        const rawStr = String(raw || '').trim();
        if (formatted !== selectedDate && rawStr !== selectedDate) {
          return false;
        }
      }

      // 3. Flow Type Filter (Income vs Expense)
      if (selectedFlow === 'revenue') {
        if (revCol && expCol && revCol !== expCol) {
          const rev = cleanNumericValue(r[revCol]) || 0;
          const exp = Math.abs(cleanNumericValue(r[expCol]) || 0);
          if (rev <= 0 && exp > 0) return false;
        } else if (revCol) {
          const rawVal = cleanNumericValue(r[revCol]) || 0;
          const typeVal = typCol ? String(r[typCol] || '').toLowerCase().trim() : '';
          if (typeVal) {
            if (/exp|deb|cost|pay|out|withdr|fee|charge|bill/i.test(typeVal)) return false;
          } else if (rawVal <= 0) {
            return false;
          }
        }
      } else if (selectedFlow === 'expense') {
        if (revCol && expCol && revCol !== expCol) {
          const exp = Math.abs(cleanNumericValue(r[expCol]) || 0);
          const rev = cleanNumericValue(r[revCol]) || 0;
          if (exp <= 0 && rev > 0) return false;
        } else if (revCol) {
          const rawVal = cleanNumericValue(r[revCol]) || 0;
          const typeVal = typCol ? String(r[typCol] || '').toLowerCase().trim() : '';
          if (typeVal) {
            if (/inc|rev|cred|dep|sale|earn|inflow/i.test(typeVal)) return false;
          } else if (rawVal >= 0) {
            return false;
          }
        }
      }

      return true;
    });

    return {
      headers: dataset.headers,
      rows: filtered,
      metadata: {
        ...dataset.metadata,
        totalRows: filtered.length,
      },
    };
  }, [dataset, selectedCategory, selectedDate, selectedFlow, effectiveCategoryCol, effectiveDateCol, effectiveTypeCol, financialKpis]);

  // Dynamically recalculate financial KPIs for active filtered subset
  const activeKpis = useMemo(() => {
    return extractFinancialKpis(filteredDataset, columns, {
      currencySymbol: financialKpis.currencySymbol,
      revenueColumn: financialKpis.revenueColumn,
      expenseColumn: financialKpis.expenseColumn,
      profitColumn: financialKpis.profitColumn,
      dateColumn: financialKpis.dateColumn,
      categoryColumn: financialKpis.categoryColumn,
      typeColumn: financialKpis.typeColumn,
    });
  }, [filteredDataset, columns, financialKpis]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedDate('all');
    setSelectedFlow('all');
  };

  const handleTriggerExport = () => {
    setInternalExportOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Excel Multi-Sheet Switcher Bar (if workbook contains > 1 sheets) */}
      {sheetNames.length > 1 && (
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto text-xs shadow-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 font-semibold px-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Workbook Sheets:</span>
          </div>
          <div className="flex items-center space-x-1.5">
            {sheetNames.map((sheet) => (
              <button
                key={sheet}
                type="button"
                onClick={() => onSwitchSheet && onSwitchSheet(sheet)}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  sheet === activeSheet
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sheet}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 1. Interactive Financial Filter Bar with Quick Actions Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex-1">
          <FilterBar
            categories={categories}
            dates={dates}
            selectedCategory={selectedCategory}
            selectedDate={selectedDate}
            selectedFlow={selectedFlow}
            onCategoryChange={setSelectedCategory}
            onDateChange={setSelectedDate}
            onFlowChange={setSelectedFlow}
            onResetFilters={handleResetFilters}
            totalCount={dataset.rows.length}
            filteredCount={filteredDataset.rows.length}
          />
        </div>

        {/* Dashboard Quick Actions: Currency Switcher, Map Columns & Export Report */}
        <div className="flex items-center space-x-2 flex-shrink-0 self-end lg:self-auto">
          {/* Quick Currency Selector */}
          {onCurrencyChange && (
            <div className="flex items-center space-x-1 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs shadow-xs">
              <span className="text-slate-500 font-medium hidden sm:inline">Currency:</span>
              <select
                value={financialKpis.currencySymbol}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-bold font-mono focus:outline-hidden cursor-pointer"
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c.symbol} value={c.symbol} className="text-slate-900 dark:bg-slate-900 dark:text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Growth Profile Refinement Button */}
          {onOpenGrowthModal && (
            <button
              type="button"
              onClick={onOpenGrowthModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 shadow-xs transition cursor-pointer"
              title="Refine 3 questions to tailor business growth suggestions"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Growth Profile</span>
            </button>
          )}

          {/* Map Columns Button */}
          {onOpenMappingModal && (
            <button
              type="button"
              onClick={onOpenMappingModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs transition cursor-pointer"
              title="Map columns and adjust data schema"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Map Columns</span>
            </button>
          )}

          {/* Export Report Button */}
          <button
            type="button"
            onClick={handleTriggerExport}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition cursor-pointer"
            title="Download PDF Financial Report"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Summary Cards */}
      <KpiOverview kpis={activeKpis} />

      {/* 3. Strategic Business Growth & Suggestions System */}
      <BusinessGrowthSuggestions
        kpis={activeKpis}
        dataset={filteredDataset}
        context={businessContext}
        onOpenContextModal={onOpenGrowthModal || (() => {})}
        isDarkMode={isDarkMode}
      />

      {/* 4. Dedicated Financial Trendline Line Graph */}
      <TrendLineChart
        dataset={filteredDataset}
        columnList={columnList}
        kpis={activeKpis}
        isDarkMode={isDarkMode}
      />

      {/* 4. Real Data Financial Highlights */}
      <FinancialInsights kpis={activeKpis} dataset={filteredDataset} />

      {/* 5. Adaptive Category Breakdown Charts */}
      <AdaptiveChartGrid
        dataset={filteredDataset}
        columnList={columnList}
        recommendations={recommendedCharts.filter((r) => r.chartType !== 'line')}
        isDarkMode={isDarkMode}
      />

      {/* 6. Filterable & Sortable Data Explorer */}
      <SmartDataTable dataset={filteredDataset} />

      {/* 7. Export Analytics Report Modal (Filtered Data & Active KPIs) */}
      <ExportReportModal
        isOpen={internalExportOpen}
        onClose={() => setInternalExportOpen(false)}
        analysis={{
          ...analysis,
          dataset: filteredDataset,
          financialKpis: activeKpis,
        }}
      />
    </div>
  );
};

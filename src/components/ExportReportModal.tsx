/**
 * FinPulse Business Financial Analyzer
 * Executive Analytics Export Center with Visual Stats, Analytical Diagnosis & Growth Suggestions
 * 
 * @module components/ExportReportModal
 */

import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import Papa from 'papaparse';
import { 
  X, 
  FileDown, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart2,
  ShieldCheck,
  Rocket,
  ArrowUpRight,
  Download,
  Info,
  Check
} from 'lucide-react';
import { DatasetAnalysisResult, BusinessContext } from '../types';
import { cleanNumericValue } from '../analyzer/typeInference';
import { generateGrowthSuggestions, BUSINESS_TYPE_LABELS } from '../analyzer/growthEngine';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: DatasetAnalysisResult;
  businessContext?: BusinessContext;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  analysis,
  businessContext = {
    businessType: 'ecommerce',
    growthPriority: 'revenue',
    businessStage: 'growth',
  },
}) => {
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const { dataset, financialKpis, columnList } = analysis;
  const sym = financialKpis.currencySymbol || '$';

  // Compute Growth Engine Strategy Output
  const growth = useMemo(() => {
    return generateGrowthSuggestions(financialKpis, dataset, businessContext);
  }, [financialKpis, dataset, businessContext]);

  // Compute Visual Category Breakdown
  const { categoryStats, topRevenueCategory, topExpenseCategory, revenueConcentration } = useMemo(() => {
    const catCol = financialKpis.categoryColumn || columnList.find((c) => c.inferredType === 'categorical')?.name;
    const expCol = financialKpis.expenseColumn;
    const revCol = financialKpis.revenueColumn;

    const catMap: Record<string, { rev: number; exp: number; total: number }> = {};
    let topRev = '';
    let topRevVal = 0;
    let topExp = '';
    let topExpVal = 0;

    if (catCol) {
      dataset.rows.forEach((r) => {
        const cat = String(r[catCol] || 'General').trim();
        if (!catMap[cat]) catMap[cat] = { rev: 0, exp: 0, total: 0 };

        let rev = 0;
        let exp = 0;

        if (revCol && expCol && revCol !== expCol) {
          rev = cleanNumericValue(r[revCol]) || 0;
          exp = Math.abs(cleanNumericValue(r[expCol]) || 0);
        } else if (revCol) {
          const val = cleanNumericValue(r[revCol]) || 0;
          if (val >= 0) rev = val;
          else exp = Math.abs(val);
        } else if (expCol) {
          exp = Math.abs(cleanNumericValue(r[expCol]) || 0);
        }

        catMap[cat].rev += rev;
        catMap[cat].exp += exp;
        catMap[cat].total += (rev + exp);

        if (catMap[cat].rev > topRevVal) {
          topRevVal = catMap[cat].rev;
          topRev = cat;
        }
        if (catMap[cat].exp > topExpVal) {
          topExpVal = catMap[cat].exp;
          topExp = cat;
        }
      });
    }

    const sortedCats = Object.entries(catMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    const totalRev = Number(financialKpis.totalRevenue) || 1;
    const concentration = (topRevVal / totalRev) * 100;

    return {
      categoryStats: sortedCats,
      topRevenueCategory: topRev || 'Primary Line',
      topExpenseCategory: topExp || 'Operations',
      revenueConcentration: Math.min(100, Math.round(concentration * 10) / 10),
    };
  }, [dataset, financialKpis, columnList]);

  // Derived Analytics Explanation Metrics
  const totalRev = Number(financialKpis.totalRevenue) || 0;
  const totalExp = Number(financialKpis.totalExpenses) || 0;
  const netProfit = Number(financialKpis.netProfit) || (totalRev - totalExp);
  const marginPct = Number(financialKpis.profitMarginPercent) || (totalRev > 0 ? (netProfit / totalRev) * 100 : 0);
  const expenseRatio = totalRev > 0 ? (totalExp / totalRev) * 100 : 100;
  const winRate = financialKpis.transactionCount > 0 
    ? ((financialKpis.profitableTransactionsCount || 0) / financialKpis.transactionCount) * 100 
    : 0;

  if (!isOpen) return null;

  // 1. Download Executive PDF Report
  const generatePdfReport = () => {
    try {
      setExportStatus('Compiling visual statistics and analytical report...');
      setDownloadSuccess(null);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Top Indigo Header Banner
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 30, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('FinPulse Executive Financial & Growth Report', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Dataset: ${dataset.metadata.filename || 'Financial Ledger'} | Rows: ${dataset.rows.length}`, 14, 25);

      // Section 1: Executive Financial KPIs
      let y = 44;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Executive Financial Key Performance Indicators', 14, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);

      const kpiLines = [
        `Total Top-Line Revenue: ${sym}${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `Total Operating Outflows: ${sym}${totalExp.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Expense Ratio: ${expenseRatio.toFixed(1)}%)`,
        `Net Operating Profit: ${sym}${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} (Operating Margin: ${marginPct.toFixed(1)}%)`,
        `Recorded Transactions: ${dataset.rows.length.toLocaleString()} (${financialKpis.profitableTransactionsCount || 0} Profitable Entries, ${winRate.toFixed(1)}% Win Rate)`,
        `Effective Tax & Deductions: ${sym}${Number(financialKpis.totalTax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      ];

      kpiLines.forEach((line) => {
        doc.text(`• ${line}`, 16, y);
        y += 6;
      });

      // Section 2: Analytical Performance Diagnosis
      y += 6;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('2. Analytical Performance Diagnosis & Explanation', 14, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);

      const diagnosisNotes = [
        `Margin Assessment: Net profit margin of ${marginPct.toFixed(1)}% indicates ${marginPct >= 18 ? 'strong capital retention and scalability' : marginPct >= 5 ? 'healthy operating buffer with targeted room for cost optimization' : 'tight unit economics requiring active cost rationalization'}.`,
        `Cost Inflow vs Outflow: Expenses consume ${expenseRatio.toFixed(1)}% of top-line revenue, leaving ${Math.max(0, 100 - expenseRatio).toFixed(1)}% as gross operating surplus before taxes.`,
        `Revenue Concentration Risk: The primary driver "${topRevenueCategory}" accounts for ${revenueConcentration.toFixed(1)}% of total revenue volume${revenueConcentration > 50 ? ' (Elevated single-stream exposure)' : ' (Well-diversified revenue mix)'}.`,
        `Operational Stability: Transaction profitability win rate is ${winRate.toFixed(1)}% across ${dataset.rows.length} analyzed ledger records.`,
      ];

      diagnosisNotes.forEach((note) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const splitText = doc.splitTextToSize(`• ${note}`, pageWidth - 32);
        doc.text(splitText, 16, y);
        y += splitText.length * 5 + 2;
      });

      // Section 3: Strategic Growth Blueprint
      y += 6;
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`3. Strategic Growth Blueprint (${businessContext.businessType.toUpperCase()} • Priority: ${businessContext.growthPriority.toUpperCase()})`, 14, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`• Growth Readiness Score: ${growth.growthReadinessScore}/100 (${growth.readinessTier}) | Modeled Upside: +${growth.projectedRevenueUpsidePercent}% (${sym}${growth.projectedRevenueUpsideAmount.toLocaleString()})`, 16, y);
      y += 6;
      doc.text(`• Annual Net Profit Lift: +${sym}${growth.projectedProfitLiftAmount.toLocaleString()} / year (from margin & volume gains)`, 16, y);
      y += 6;
      doc.text(`• Primary Growth Bottleneck: ${growth.primaryBottleneck}`, 16, y);
      y += 7;

      growth.strategicLevers.slice(0, 3).forEach((lever) => {
        if (y > 255) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text(`[${lever.priority.toUpperCase()}] ${lever.title} (${lever.impactEstimation})`, 16, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const descLines = doc.splitTextToSize(lever.description, pageWidth - 36);
        doc.text(descLines, 16, y);
        y += descLines.length * 4.5 + 3;
      });

      // Section 4: Revenue & Expense Highlights
      y += 6;
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('4. Revenue & Expense Highlights by Category', 14, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);

      if (categoryStats.length > 0) {
        categoryStats.forEach((cat) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(`• ${cat.name}: Revenue ${sym}${Math.round(cat.rev).toLocaleString()} | Expenses ${sym}${Math.round(cat.exp).toLocaleString()} | Net: ${sym}${Math.round(cat.rev - cat.exp).toLocaleString()}`, 16, y);
          y += 6;
        });
      } else {
        doc.text('• Uniform Transaction Flow: Single stream ledger entries.', 16, y);
        y += 6;
      }

      // Save PDF
      doc.save(`FinPulse_Executive_Financial_Report_${Date.now()}.pdf`);
      setExportStatus(null);
      setDownloadSuccess('Executive PDF Report downloaded successfully!');
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      setExportStatus(`Export failed: ${err.message || 'Unknown error'}`);
    }
  };

  // 2. Download Cleaned Dataset (CSV)
  const exportCleanCsv = () => {
    try {
      const csvString = Papa.unparse(dataset.rows);
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finpulse_clean_data_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess('Clean CSV dataset downloaded successfully!');
    } catch (err: any) {
      console.error('CSV Export Error:', err);
      setExportStatus(`CSV export failed: ${err.message || 'Unknown error'}`);
    }
  };

  // 3. Download Full Analysis (JSON)
  const exportJsonSummary = () => {
    try {
      const summary = {
        generatedAt: new Date().toISOString(),
        metadata: dataset.metadata,
        financialKpis,
        analyticalDiagnosis: {
          profitMarginPercent: marginPct,
          expenseToRevenueRatio: expenseRatio,
          transactionWinRatePercent: winRate,
          primaryRevenueCategory: topRevenueCategory,
          primaryExpenseCategory: topExpenseCategory,
          revenueConcentrationPercent: revenueConcentration,
        },
        growthSuggestions: growth,
        columns: columnList.map((c) => ({
          name: c.name,
          type: c.inferredType,
          semanticRole: c.semanticRole,
          nullCount: c.nullCount,
        })),
        sampleRows: dataset.rows.slice(0, 100),
      };

      const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finpulse_analysis_blueprint_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess('Complete Analysis JSON blueprint downloaded!');
    } catch (err: any) {
      console.error('JSON Export Error:', err);
      setExportStatus(`JSON export failed: ${err.message || 'Unknown error'}`);
    }
  };

  const businessTypeInfo = BUSINESS_TYPE_LABELS[businessContext.businessType] || BUSINESS_TYPE_LABELS.general;

  // Visual Proportions for Revenue vs Expense
  const expenseBarWidth = Math.min(100, Math.max(0, expenseRatio));
  const profitBarWidth = Math.min(100, Math.max(0, 100 - expenseBarWidth));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Executive Export & Intelligence Center
                </h3>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  {businessTypeInfo.icon} {businessTypeInfo.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review visual statistics, analytical diagnosis, and growth suggestions before downloading.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1">
          {/* Notification Alerts */}
          {exportStatus && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
              <span>{exportStatus}</span>
            </div>
          )}

          {downloadSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center space-x-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span className="font-semibold">{downloadSuccess}</span>
            </div>
          )}

          {/* 1. VISUAL STATS SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <span>Executive Visual Statistics</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                {dataset.metadata.filename || 'Dataset'} • {dataset.rows.length.toLocaleString()} Records
              </span>
            </div>

            {/* 4 Mini KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
                  {sym}{totalRev.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  <span>Gross Inflow</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operating Expenses</span>
                <div className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                  {sym}{totalExp.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {expenseRatio.toFixed(1)}% of Revenue
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Profit</span>
                <div className={`text-base sm:text-lg font-black mt-0.5 truncate ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                  {netProfit >= 0 ? '+' : ''}{sym}{netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Retained Earnings
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Profit Margin</span>
                <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                  {marginPct.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {marginPct >= 15 ? 'High Efficiency' : 'Standard Yield'}
                </div>
              </div>
            </div>

            {/* Visual Proportion Bar (Inflow vs Outflow) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Capital Flow Ratio (Expenses vs Net Profit)
                </span>
                <div className="flex items-center space-x-3 text-[11px] font-medium">
                  <span className="flex items-center text-rose-600 dark:text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" />
                    Expenses: {expenseRatio.toFixed(1)}%
                  </span>
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                    Net Profit: {Math.max(0, 100 - expenseRatio).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Multi-Segmented Ratio Bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                <div 
                  className="bg-rose-500 h-full transition-all duration-500" 
                  style={{ width: `${expenseBarWidth}%` }}
                  title={`Operating Expenses: ${expenseRatio.toFixed(1)}%`}
                />
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${profitBarWidth}%` }}
                  title={`Net Retained Profit: ${Math.max(0, 100 - expenseRatio).toFixed(1)}%`}
                />
              </div>

              {/* Category Mini-Bars */}
              {categoryStats.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Volume Contribution by Category:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categoryStats.map((cat, idx) => {
                      const share = totalRev > 0 ? (cat.rev / totalRev) * 100 : 0;
                      return (
                        <div key={idx} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-xs">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            <span className="truncate max-w-[90px]">{cat.name}</span>
                            <span className="font-mono text-slate-400">{share.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, share)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. ANALYTICAL EXPLANATION SECTION */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-emerald-500" />
              <span>Analytical Explanation & Performance Diagnosis</span>
            </h4>

            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Point 1: Operating Margin & Burn */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Operating Margin & Cost Efficiency</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    Your business operates at a <strong className="text-slate-900 dark:text-white">{marginPct.toFixed(1)}% operating margin</strong>. Operating outflows absorb <strong className="text-slate-900 dark:text-white">{expenseRatio.toFixed(1)}%</strong> of top-line revenue, leaving {sym}{netProfit.toLocaleString()} in net surplus.
                  </p>
                </div>

                {/* Point 2: Transaction Quality */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Ledger Health & Win Consistency</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    <strong className="text-slate-900 dark:text-white">{winRate.toFixed(1)}% of recorded entries</strong> are positive cashflow transactions ({financialKpis.profitableTransactionsCount} out of {dataset.rows.length} total entries), indicating stable baseline order flow.
                  </p>
                </div>

                {/* Point 3: Concentration Risk */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <PieChart className="w-3.5 h-3.5 text-amber-500" />
                    <span>Revenue Driver Concentration</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    The primary revenue line <strong className="text-slate-900 dark:text-white">"{topRevenueCategory}"</strong> contributes <strong className="text-slate-900 dark:text-white">{revenueConcentration.toFixed(1)}%</strong> of total volume. {revenueConcentration > 50 ? 'High concentration warrants channel diversification.' : 'Healthy spread reduces operational volatility.'}
                  </p>
                </div>

                {/* Point 4: Largest Cost Commitment */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-rose-500" />
                    <span>Primary Expense Center</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    Expenses in <strong className="text-slate-900 dark:text-white">"{topExpenseCategory}"</strong> represent the single largest capital outflow. Rationalizing 8–10% of this line item will immediately widen net operating margins.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. TAILORED GROWTH SUGGESTIONS SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <Rocket className="w-4 h-4 text-indigo-500" />
                <span>Tailored Future Growth Suggestions & Levers</span>
              </h4>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Readiness Score: {growth.growthReadinessScore}/100 ({growth.readinessTier})
              </span>
            </div>

            {/* Strategic Levers Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {growth.strategicLevers.slice(0, 2).map((lever) => (
                <div
                  key={lever.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {lever.priority} Priority
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {lever.impactEstimation}
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {lever.title}
                    </h5>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {lever.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      {lever.actionItems.slice(0, 2).map((action, aIdx) => (
                        <div key={aIdx} className="flex items-start space-x-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                          <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Potential Upside Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Modeled Growth Upside: +{growth.projectedRevenueUpsidePercent}% Top-Line (+{sym}{growth.projectedRevenueUpsideAmount.toLocaleString()})
                </span>
              </div>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                Estimated Net Profit Gain: +{sym}{growth.projectedProfitLiftAmount.toLocaleString()} / year
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Footer with 3 Downloadation Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>100% Client-Side Processing • Zero Data Transferred to External Servers</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Download Clean CSV */}
            <button
              type="button"
              onClick={exportCleanCsv}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Download cleaned CSV records"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Clean CSV</span>
            </button>

            {/* Download JSON Blueprint */}
            <button
              type="button"
              onClick={exportJsonSummary}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Download JSON Analysis Blueprint"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>JSON Blueprint</span>
            </button>

            {/* Download Executive PDF Report */}
            <button
              type="button"
              onClick={generatePdfReport}
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md hover:shadow-indigo-500/25 transition cursor-pointer"
              title="Download Complete Executive PDF Report"
            >
              <FileText className="w-4 h-4" />
              <span>Download Executive PDF Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Clipboard, 
  X, 
  Sparkles, 
  FileText, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function QuickPasteModal({ isOpen, onClose, onDataParsed }) {
  const [pastedText, setPastedText] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleProcessPastedData = () => {
    setError(null);
    const trimmed = pastedText.trim();
    if (!trimmed) {
      setError('Please paste tabular text (e.g. from Excel, Google Sheets, or CSV).');
      return;
    }

    try {
      // Create a virtual CSV file
      // If it contains tabs, convert tabs to commas
      let csvString = trimmed;
      if (trimmed.includes('\t') && !trimmed.includes(',')) {
        csvString = trimmed
          .split('\n')
          .map((line) =>
            line
              .split('\t')
              .map((cell) => `"${cell.replace(/"/g, '""').trim()}"`)
              .join(',')
          )
          .join('\n');
      }

      const file = new File([csvString], 'pasted_financial_data.csv', {
        type: 'text/csv',
      });

      onDataParsed(file);
      onClose();
    } catch (err) {
      setError(`Failed to parse pasted data: ${err.message}`);
    }
  };

  const handleLoadSamplePaste = () => {
    setPastedText(`Date\tCategory\tDescription\tRevenue\tExpense
2024-01-15\tSoftware & SaaS\tEnterprise Cloud Hosting\t$42500\t$12400
2024-02-10\tMarketing & Ads\tQ1 Growth Campaign\t$51200\t$24600
2024-03-05\tSoftware & SaaS\tAnnual SaaS Subscriptions\t$65000\t$14200
2024-04-12\tProduct Sales\tFlagship Enterprise Licenses\t$89000\t$21500
2024-05-24\tMarketing & Ads\tSearch & Social Retargeting\t$48200\t$19800
2024-06-15\tSoftware & SaaS\tCustom Feature Expansion\t$73400\t$16500
2024-07-14\tProduct Sales\tTier 2 Enterprise Expansion\t$94000\t$23000
2024-08-11\tSoftware & SaaS\tRecurring Platform Subscriptions\t$81200\t$15800
2024-09-09\tConsulting\tExecutive Security Review\t$41500\t$7500
2024-10-07\tProduct Sales\tQ4 Enterprise Rollout\t$112000\t$31000
2024-11-12\tSoftware & SaaS\tEnterprise Add-on Packs\t$78500\t$17200
2024-12-10\tProduct Sales\tAnnual Software Renewals\t$128000\t$29500`);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clipboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Paste Spreadsheet Data Directly
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Copy cells from Microsoft Excel, Google Sheets, or Numbers and paste them here
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Paste Table / CSV / TSV Rows:
            </label>
            <button
              onClick={handleLoadSamplePaste}
              type="button"
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Fill with Sample Excel Data</span>
            </button>
          </div>

          <textarea
            rows={10}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={`Date\tCategory\tDescription\tRevenue\tExpense\n2024-01-15\tSaaS\tCloud Subscription\t$50000\t$12000...`}
            className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
          />

          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            💡 Tip: Columns can include Date, Category, Description, Revenue, and Expenses in any order. The engine will auto-detect headers!
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            Cancel
          </button>

          <button
            onClick={handleProcessPastedData}
            className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-sm"
          >
            <span>Analyze Pasted Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

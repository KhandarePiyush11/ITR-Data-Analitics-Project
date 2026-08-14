import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sliders, 
  HelpCircle, 
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function ColumnMappingModal({ 
  isOpen, 
  onClose, 
  headers, 
  currentMapping, 
  onApplyMapping 
}) {
  if (!isOpen) return null;

  const [dateKey, setDateKey] = useState(currentMapping.dateKey || '');
  const [revenueKey, setRevenueKey] = useState(currentMapping.revenueKey || '');
  const [expenseKey, setExpenseKey] = useState(currentMapping.expenseKey || '');
  const [profitKey, setProfitKey] = useState(currentMapping.profitKey || '');
  const [categoryKey, setCategoryKey] = useState(currentMapping.categoryKey || '');
  const [descriptionKey, setDescriptionKey] = useState(currentMapping.descriptionKey || '');

  const handleSave = () => {
    onApplyMapping({
      dateKey: dateKey || null,
      revenueKey: revenueKey || null,
      expenseKey: expenseKey || null,
      profitKey: profitKey || null,
      categoryKey: categoryKey || null,
      descriptionKey: descriptionKey || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Column Field Mapping
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect or re-assign detected CSV headers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <span>
              We auto-detected the fields below from your CSV header row. You can adjust which columns represent each financial metric.
            </span>
          </div>

          {/* Date Column */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date / Timeline Column
            </label>
            <select
              value={dateKey}
              onChange={(e) => setDateKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">-- None / Auto Sequential Dates --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Revenue Column */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Revenue / Sales Column
            </label>
            <select
              value={revenueKey}
              onChange={(e) => setRevenueKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">-- None --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Column */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expenses / Costs Column
            </label>
            <select
              value={expenseKey}
              onChange={(e) => setExpenseKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">-- None --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Profit Column */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Net Profit Column (Optional)
            </label>
            <select
              value={profitKey}
              onChange={(e) => setProfitKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">-- Auto Calculate: Revenue - Expense --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Category Column */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category / Product Segment
            </label>
            <select
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">-- None --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Description Column */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Memo Column
            </label>
            <select
              value={descriptionKey}
              onChange={(e) => setDescriptionKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">-- None --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            type="button"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
          >
            <Check className="w-4 h-4" />
            <span>Apply Mappings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  Layers, 
  ShieldCheck,
  Compass
} from 'lucide-react';

export default function FinancialGlossaryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const glossaryItems = [
    {
      term: 'Gross Revenue (Inflow)',
      formula: 'Sum of all sales receipts, invoices, and subscription earnings',
      desc: 'The total amount of money brought in by a business from its operational activities before deducting any costs or expenses.',
      icon: DollarSign,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      term: 'Total Expenses (Outflow)',
      formula: 'Cost of Goods Sold (COGS) + Operating Expenditures (OPEX)',
      desc: 'All funds paid out to maintain operations, including payroll, inventory, software tooling, marketing, utilities, and office lease.',
      icon: Layers,
      color: 'text-rose-500 dark:text-rose-400',
    },
    {
      term: 'Net Profit / Net Income',
      formula: 'Gross Revenue − Total Expenses',
      desc: 'The actual bottom-line financial gain (or loss if negative) after all operating costs have been settled. Indicates real wealth generation.',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      term: 'Net Profit Margin (%)',
      formula: '(Net Profit ÷ Gross Revenue) × 100',
      desc: 'Measures how much net profit is generated for every $1 of revenue. Margins above 20% generally reflect high pricing power and strong resilience.',
      icon: Percent,
      color: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      term: 'Expense Absorption Ratio',
      formula: '(Total Expenses ÷ Gross Revenue) × 100',
      desc: 'The percentage of top-line earnings consumed by operating overhead. Lower is healthier (sub-70% allows healthy reinvestment).',
      icon: ShieldCheck,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      term: 'Break-Even Benchmark',
      formula: 'Net Profit = $0.00',
      desc: 'The exact point where revenues perfectly balance expenditures without generating profit or incurring deficit.',
      icon: Compass,
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Financial Metrics & Analysis Guide
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Core concepts, formulas, and metric interpretations
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-600 dark:text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {glossaryItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {item.term}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-700/40 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    {item.formula}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-sm"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}

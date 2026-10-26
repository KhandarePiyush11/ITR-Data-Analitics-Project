import React from 'react';
import { 
  Sparkles, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Scissors, 
  Rocket, 
  ShieldAlert,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { generateBusinessInsights } from '../utils/insightsEngine';
import { formatCurrency } from '../utils/formatters';

export default function AiInsightsCard({ kpis, timeline, categories, currencySymbol = '$' }) {
  const insights = generateBusinessInsights(kpis, timeline, categories, currencySymbol);

  const getRecommendationIcon = (iconName) => {
    switch (iconName) {
      case 'Scissors':
        return <Scissors className="w-4 h-4 text-rose-500" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-indigo-500" />;
      case 'Rocket':
        return <Rocket className="w-4 h-4 text-emerald-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-cyan-500" />;
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Top Banner with Health Score */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Executive Health & Strategic Insights
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                AI Diagnostic
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated financial assessment, driver breakdown, and profitability roadmap
            </p>
          </div>
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Health Score
            </div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {insights.statusSummary}
            </div>
          </div>

          <div className={`px-4 py-2 rounded-2xl border flex items-center space-x-2 ${insights.gradeBg}`}>
            <span className={`text-2xl font-black tracking-tight ${insights.gradeColor}`}>
              {insights.grade}
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
              ({insights.score}/100)
            </span>
          </div>
        </div>
      </div>

      {/* Highlights Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {insights.topRevenue && (
          <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
              Top Revenue Driver
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-sm truncate mt-0.5">
              {insights.topRevenue.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {formatCurrency(insights.topRevenue.value, currencySymbol)} ({insights.topRevenue.share}% share)
            </div>
          </div>
        )}

        {insights.topExpense && (
          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
              Primary Cost Center
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-sm truncate mt-0.5">
              {insights.topExpense.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {formatCurrency(insights.topExpense.value, currencySymbol)} ({insights.topExpense.share}% of costs)
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
            Profit Win Rate
          </span>
          <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
            {insights.winRate}% Profitable Rows
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            {kpis.profitableRowsCount} / {kpis.totalTransactions} transactions
          </div>
        </div>
      </div>

      {/* Strategic Recommendations Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Strategic Action Plan for Margin Optimization:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {insights.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 shadow-xs">
                    {getRecommendationIcon(rec.icon)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                    {rec.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {rec.impact}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

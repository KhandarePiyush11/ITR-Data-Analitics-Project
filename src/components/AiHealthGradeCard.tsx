/**
 * FinPulse Business Financial Analyzer
 * Strategic Business Health Scorecard & AI Recommendations
 * 
 * @module components/AiHealthGradeCard
 */

import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Scissors, 
  Rocket, 
  Receipt 
} from 'lucide-react';
import { HealthScorecard } from '../types';

interface AiHealthGradeCardProps {
  scorecard: HealthScorecard;
}

export const AiHealthGradeCard: React.FC<AiHealthGradeCardProps> = ({ scorecard }) => {
  const { overallScore, letterGrade, verdict, metrics, actionableInsights } = scorecard;

  const gradeColors: Record<string, string> = {
    'A+': 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    'A': 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
    'B': 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800',
    'C': 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
    'D': 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800',
    'F': 'text-rose-700 bg-rose-100 dark:bg-rose-950 border-rose-400 dark:border-rose-700',
  };

  const currentGradeStyle = gradeColors[letterGrade] || gradeColors['B'];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return <Scissors className="w-4 h-4 text-rose-500" />;
      case 'growth_opportunity':
        return <Rocket className="w-4 h-4 text-emerald-500" />;
      case 'risk_warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'tax_saving':
        return <Receipt className="w-4 h-4 text-cyan-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      {/* Top Header & Grade Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Financial Health & Risk Profile</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated across margin strength, burn rate, and cashflow consistency
            </p>
          </div>
        </div>

        {/* Big Letter Grade Pill */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Composite Score</div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{overallScore} / 100</div>
          </div>
          <div
            className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black shadow-xs ${currentGradeStyle}`}
          >
            {letterGrade}
          </div>
        </div>
      </div>

      {/* Health Verdict Callout */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{verdict}</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-500 dark:text-slate-400 text-[11px]">
          <span>Operating Margin: <strong className="text-slate-700 dark:text-slate-300">{metrics.marginGrade}</strong></span>
          <span>Expense Load: <strong className="text-slate-700 dark:text-slate-300">{metrics.expenseEfficiencyRatio}%</strong></span>
          <span>Win Rate: <strong className="text-slate-700 dark:text-slate-300">{metrics.winRate}%</strong></span>
        </div>
      </div>

      {/* Strategic Recommendations Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Executive Strategic Recommendations
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {actionableInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {getInsightIcon(insight.type)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {insight.impactEstimation}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  {insight.title}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {insight.recommendation}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Priority: <strong className="uppercase font-semibold text-slate-600 dark:text-slate-300">{insight.priority}</strong></span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center space-x-0.5 cursor-pointer hover:underline">
                  <span>Action Plan</span>
                  <TrendingUp className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

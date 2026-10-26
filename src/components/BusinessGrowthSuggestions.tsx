/**
 * FinPulse Business Financial Analyzer
 * Strategic Business Growth & Advisory Blueprint Component
 * 
 * Delivers customized growth strategies, actionable roadmaps,
 * and an interactive what-if financial simulator.
 * 
 * @module components/BusinessGrowthSuggestions
 */

import React, { useState, useMemo } from 'react';
import { 
  Rocket, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  SlidersHorizontal, 
  Calendar, 
  CheckCircle2, 
  BarChart3, 
  ArrowUpRight, 
  AlertTriangle,
  Lightbulb,
  Zap,
  Target,
  Percent,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  FinancialKpiSummary, 
  UnifiedDataset, 
  BusinessContext 
} from '../types';
import { 
  generateGrowthSuggestions, 
  BUSINESS_TYPE_LABELS 
} from '../analyzer/growthEngine';

interface BusinessGrowthSuggestionsProps {
  kpis: FinancialKpiSummary;
  dataset: UnifiedDataset;
  context: BusinessContext;
  onOpenContextModal: () => void;
  isDarkMode?: boolean;
}

export const BusinessGrowthSuggestions: React.FC<BusinessGrowthSuggestionsProps> = ({
  kpis,
  dataset,
  context,
  onOpenContextModal,
}) => {
  const [activeTab, setActiveTab] = useState<'levers' | 'roadmap' | 'simulator' | 'benchmarks'>('levers');

  // Simulator Sliders State
  const [targetRevenueGrowth, setTargetRevenueGrowth] = useState<number>(15);
  const [targetCostEfficiency, setTargetCostEfficiency] = useState<number>(6);

  // Checked roadmap milestones state
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  const toggleMilestone = (key: string) => {
    setCompletedMilestones((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Generate Growth Engine Strategy Output
  const analysis = useMemo(() => {
    return generateGrowthSuggestions(kpis, dataset, context);
  }, [kpis, dataset, context]);

  const sym = kpis.currencySymbol || '$';
  const totalRev = Number(kpis.totalRevenue) || 0;
  const totalExp = Number(kpis.totalExpenses) || 0;
  const currentNetProfit = Number(kpis.netProfit) || (totalRev - totalExp);
  const currentMargin = Number(kpis.profitMarginPercent) || (totalRev > 0 ? (currentNetProfit / totalRev) * 100 : 0);

  // Real-time What-If Simulator Calculations
  const simulatedRevenue = totalRev * (1 + targetRevenueGrowth / 100);
  const simulatedExpenses = totalExp * (1 - targetCostEfficiency / 100);
  const simulatedProfit = simulatedRevenue - simulatedExpenses;
  const simulatedMargin = simulatedRevenue > 0 ? (simulatedProfit / simulatedRevenue) * 100 : 0;
  const simulatedNetGain = simulatedProfit - currentNetProfit;

  const currentTypeInfo = BUSINESS_TYPE_LABELS[context.businessType] || BUSINESS_TYPE_LABELS.general;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Accelerated':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800';
      case 'Strong':
        return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800';
      case 'Needs Optimization':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800';
      default:
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'high':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-6">
      {/* 1. Header with Dynamic Profile Chips & Customize Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              AI Future Growth Advisory & Suggestions
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Strategic Business Growth Blueprint</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            {analysis.growthSummary}
          </p>
        </div>

        {/* Profile Attributes & Edit Button */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <span>{currentTypeInfo.icon}</span>
            <span className="font-semibold">{currentTypeInfo.name}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 capitalize">
            🎯 <span className="font-semibold">{context.growthPriority} Target</span>
          </div>

          <button
            type="button"
            onClick={onOpenContextModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 transition cursor-pointer"
            title="Adjust your 3 business questions to tailor suggestions"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Refine Profile</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Growth Readiness Score */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Growth Readiness</span>
            <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getTierColor(analysis.readinessTier)}`}>
              {analysis.readinessTier}
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {analysis.growthReadinessScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          {/* Progress meter */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analysis.growthReadinessScore}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Projected Topline Upside */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Projected Upside</span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
              +{analysis.projectedRevenueUpsidePercent}%
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              +{sym}{analysis.projectedRevenueUpsideAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Targetable top-line volume
            </div>
          </div>
        </div>

        {/* Metric 3: Estimated Net Profit Lift */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Annual Profit Lift</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              +{analysis.projectedMarginLiftPercent}% Margin
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              +{sym}{analysis.projectedProfitLiftAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Take-home profit potential
            </div>
          </div>
        </div>

        {/* Metric 4: Primary Bottleneck */}
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Identified Bottleneck</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mt-1">
            {analysis.primaryBottleneck}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-2">
            Prioritized below in strategic levers ↓
          </div>
        </div>
      </div>

      {/* 3. Navigation View Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('levers')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'levers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Rocket className="w-4 h-4" />
          <span>Strategic Levers ({analysis.strategicLevers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'roadmap'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>30-60-90 Day Roadmap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>What-If Growth Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('benchmarks')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer ${
            activeTab === 'benchmarks'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Industry Benchmarks</span>
        </button>
      </div>

      {/* 4. Tab Content Panels */}
      
      {/* Panel A: Strategic Growth Levers */}
      {activeTab === 'levers' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.strategicLevers.map((lever) => (
              <div
                key={lever.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getPriorityBadge(lever.priority)}`}>
                      {lever.priority} Priority
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {lever.impactEstimation}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 flex items-center space-x-1.5">
                      <span>{lever.title}</span>
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {lever.description}
                    </p>
                  </div>

                  {/* Action Checklist */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Execution Action Items:
                    </div>
                    {lever.actionItems.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium capitalize">Category: {lever.category}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center space-x-1">
                    <span>High Yield</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel B: 30-60-90 Day Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.roadmap.map((phase, pIdx) => {
              const phaseBadge = pIdx === 0 ? 'Month 1' : pIdx === 1 ? 'Month 2' : 'Month 3';
              return (
                <div
                  key={phase.phase}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                        {phaseBadge} • {phase.phase}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {phase.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {phase.focus}
                      </p>
                    </div>

                    {/* Interactive Milestone Checkboxes */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      {phase.milestones.map((m, mIdx) => {
                        const mKey = `${phase.phase}-${mIdx}`;
                        const isDone = !!completedMilestones[mKey];
                        return (
                          <div
                            key={mIdx}
                            onClick={() => toggleMilestone(mKey)}
                            className={`p-2 rounded-xl border text-xs cursor-pointer transition flex items-start space-x-2.5 ${
                              isDone
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-slate-500 line-through'
                                : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:border-indigo-300'
                            }`}
                          >
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            )}
                            <span className="leading-snug">{m}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Panel C: What-If Growth Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simulator Controls */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                  <span>Growth Hypothesis Parameters</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adjust targets to model future financial performance based on your historical numbers.
                </p>
              </div>

              {/* Slider 1: Revenue Target */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Target Revenue Growth:
                  </label>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    +{targetRevenueGrowth}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={targetRevenueGrowth}
                  onChange={(e) => setTargetRevenueGrowth(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Conservative (+5%)</span>
                  <span>Moderate (+20%)</span>
                  <span>Hypergrowth (+60%)</span>
                </div>
              </div>

              {/* Slider 2: Cost Efficiency Target */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Expense Trimming & Efficiency:
                  </label>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    -{targetCostEfficiency}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={targetCostEfficiency}
                  onChange={(e) => setTargetCostEfficiency(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Light Audit (-3%)</span>
                  <span>Strategic (-10%)</span>
                  <span>Aggressive (-25%)</span>
                </div>
              </div>

              {/* Reset to Recommended */}
              <button
                type="button"
                onClick={() => {
                  setTargetRevenueGrowth(15);
                  setTargetCostEfficiency(6);
                }}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition cursor-pointer"
              >
                Reset to Recommended Baseline
              </button>
            </div>

            {/* Simulated Outcome Cards */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Projected Revenue */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Projected New Revenue
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {sym}{Math.round(simulatedRevenue).toLocaleString()}
                  </div>
                  <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>+{sym}{Math.round(simulatedRevenue - totalRev).toLocaleString()} Topline Lift</span>
                  </div>
                </div>

                {/* Projected Expenses */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Projected Optimized Expenses
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {sym}{Math.round(simulatedExpenses).toLocaleString()}
                  </div>
                  <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center space-x-1">
                    <span>Direct savings: {sym}{Math.round(totalExp - simulatedExpenses).toLocaleString()}</span>
                  </div>
                </div>

                {/* Projected Net Profit */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Projected New Net Profit
                      </div>
                      <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        {sym}{Math.round(simulatedProfit).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Projected Margin</div>
                      <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {simulatedMargin.toFixed(1)}%
                      </div>
                      <div className="text-[11px] text-emerald-500 font-semibold">
                        {simulatedMargin > currentMargin ? `+${(simulatedMargin - currentMargin).toFixed(1)}% gain` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Annualized Upside Callout */}
                  <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                      Total Annualized Net Profit Improvement:
                    </span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                      +{sym}{Math.round(simulatedNetGain).toLocaleString()} / year
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel D: Industry Benchmarks */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analysis.benchmarks.map((bm, idx) => {
              const statusColor = 
                bm.status === 'above'
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
                  : bm.status === 'on-par'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800'
                  : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';

              const statusText = 
                bm.status === 'above' ? 'Above Average' : bm.status === 'on-par' ? 'Industry Median' : 'Room to Improve';

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {bm.metric}
                    </span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {bm.yourValue}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Benchmark: {bm.industryAverage}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

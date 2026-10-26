/**
 * FinPulse Business Financial Analyzer
 * Quick Business Profile & Growth Intentions Modal (2-3 Questions)
 * 
 * Displayed upon file ingestion or user prompt to contextualize
 * financial analysis for tailored growth recommendations.
 * 
 * @module components/GrowthQuestionsModal
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  Target, 
  Building2, 
  TrendingUp, 
  Check, 
  Compass,
  DollarSign,
  ShieldAlert,
  Repeat
} from 'lucide-react';
import { BusinessContext, BusinessType, GrowthPriority, BusinessStage } from '../types';
import { BUSINESS_TYPE_LABELS } from '../analyzer/growthEngine';

interface GrowthQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveContext: (context: BusinessContext) => void;
  initialContext?: BusinessContext;
}

export const GrowthQuestionsModal: React.FC<GrowthQuestionsModalProps> = ({
  isOpen,
  onClose,
  onSaveContext,
  initialContext = {
    businessType: 'ecommerce',
    growthPriority: 'revenue',
    businessStage: 'growth',
  },
}) => {
  const [businessType, setBusinessType] = useState<BusinessType>(initialContext.businessType);
  const [growthPriority, setGrowthPriority] = useState<GrowthPriority>(initialContext.growthPriority);
  const [businessStage, setBusinessStage] = useState<BusinessStage>(initialContext.businessStage);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveContext({
      businessType,
      growthPriority,
      businessStage,
    });
    onClose();
  };

  const GROWTH_PRIORITIES: Array<{
    id: GrowthPriority;
    title: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'revenue',
      title: 'Aggressive Revenue Scaling',
      description: 'Expand customer volume, sales channels, and top-line growth velocity',
      icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'margin',
      title: 'Profit Margin & Cost Efficiency',
      description: 'Maximize take-home net profit, streamline overhead, and raise unit economics',
      icon: <DollarSign className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'cashflow',
      title: 'Cashflow Runway & Solvency',
      description: 'Extend working capital, shorten receivables lag, and fortify reserves',
      icon: <ShieldAlert className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'retention',
      title: 'Customer Retention & LTV',
      description: 'Boost repeat purchase frequency, loyalty, and slash account churn',
      icon: <Repeat className="w-4 h-4 text-purple-500" />,
    },
  ];

  const STAGES: Array<{
    id: BusinessStage;
    label: string;
    sublabel: string;
  }> = [
    { id: 'early', label: 'Early Stage', sublabel: '< $250k Annual Volume' },
    { id: 'growth', label: 'Scaling & Growth', sublabel: '$250k - $2M Annual Volume' },
    { id: 'enterprise', label: 'Established / Mature', sublabel: '$2M+ Annual Volume' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Smart Business Growth Profiler</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Tailor Your Growth Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Answer 3 quick questions so FinPulse can synthesize precision growth tactics, revenue upside projections, and customized action roadmaps for your specific business.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1: Business Model */}
          <div className="space-y-2.5">
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>1. What best describes your business model?</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(BUSINESS_TYPE_LABELS) as BusinessType[]).map((type) => {
                const info = BUSINESS_TYPE_LABELS[type];
                const isSelected = businessType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBusinessType(type)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{info.icon}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {info.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Primary Strategic Focus */}
          <div className="space-y-2.5">
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Target className="w-4 h-4 text-emerald-500" />
              <span>2. What is your primary growth target right now?</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GROWTH_PRIORITIES.map((priority) => {
                const isSelected = growthPriority === priority.id;
                return (
                  <button
                    key={priority.id}
                    type="button"
                    onClick={() => setGrowthPriority(priority.id)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start space-x-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-xs">
                      {priority.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {priority.title}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {priority.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 3: Current Scale / Stage */}
          <div className="space-y-2.5">
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>3. Current operational scale?</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STAGES.map((stage) => {
                const isSelected = businessStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setBusinessStage(stage.id)}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`text-xs font-bold ${isSelected ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
                      {stage.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {stage.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
            >
              Skip with Defaults
            </button>

            <button
              type="submit"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-md hover:shadow-indigo-500/25 transition cursor-pointer"
            >
              <span>Generate Strategic Growth Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

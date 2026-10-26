/**
 * FinPulse Business Financial Analyzer
 * Adaptive Financial Visualization Grid
 * 
 * @module components/AdaptiveChartGrid
 */

import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { 
  UnifiedDataset, 
  ColumnProfile, 
  ChartRecommendation, 
  ActiveChartConfig 
} from '../types';
import { ChartWidget } from './ChartWidget';

interface AdaptiveChartGridProps {
  dataset: UnifiedDataset;
  columnList: ColumnProfile[];
  recommendations: ChartRecommendation[];
  isDarkMode: boolean;
}

export const AdaptiveChartGrid: React.FC<AdaptiveChartGridProps> = ({
  dataset,
  columnList,
  recommendations,
  isDarkMode,
}) => {
  // Convert recommendations to active chart states (limit to top 2-3 most valuable financial charts)
  const [activeConfigs, setActiveConfigs] = useState<ActiveChartConfig[]>(() => {
    return recommendations.slice(0, 3).map((rec) => ({
      id: rec.id,
      title: rec.title,
      chartType: rec.chartType,
      dimensionKey: rec.dimensionKey,
      metricKeys: rec.metricKeys,
      aggregation: rec.aggregation,
      dateGranularity: rec.dateGranularity,
      isCumulative: false,
      showTrendline: rec.showTrendline ?? true,
    }));
  });

  // Keep configs synchronized when recommendation list updates
  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      setActiveConfigs(
        recommendations.slice(0, 3).map((rec) => ({
          id: rec.id,
          title: rec.title,
          chartType: rec.chartType,
          dimensionKey: rec.dimensionKey,
          metricKeys: rec.metricKeys,
          aggregation: rec.aggregation,
          dateGranularity: rec.dateGranularity,
          isCumulative: false,
          showTrendline: rec.showTrendline ?? true,
        }))
      );
    }
  }, [recommendations]);

  if (activeConfigs.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <BarChart3 className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Visual Financial Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive trendline and category distribution
          </p>
        </div>
      </div>

      {/* Grid of Clean Chart Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activeConfigs.map((config) => (
          <ChartWidget
            key={config.id}
            dataset={dataset}
            columnList={columnList}
            initialConfig={config}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
};
